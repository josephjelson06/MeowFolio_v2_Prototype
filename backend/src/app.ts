import path from 'node:path';
import { randomUUID } from 'node:crypto';
import cors from 'cors';
import express from 'express';
import multer from 'multer';
import { env, paths } from './config/env';
import { pool } from './db/pool';
import { HttpError } from './lib/httpError';
import { buildUsageMetrics, getProfileSummary } from './modules/profile/service';
import { dashboardTips } from './modules/tips/service';
import { getTemplateRuntimeMeta, templateRegistry } from './modules/templates/templateRegistry';
import { buildTexExportPayload } from './modules/templates/texRenderer';
import { getDefaultDevUser, getUserById } from './modules/users/repository';
import { extractTextFromUpload } from './modules/imports/textExtraction';
import { importResumeFromText } from './modules/imports/resumeImporter';
import { createJd, deleteJd, getJdById, listJds, toJdRecord, updateJd } from './modules/jds/repository';
import { deriveJdParsedMeta, scoreResumeAgainstJd } from './modules/jds/scoring';
import { createResume, deleteResume, getResumeById, listResumes, toResumeSummary, updateResume } from './modules/resumes/repository';
import { normalizeRenderOptions, normalizeResumeData } from './modules/resumes/normalizer';
import { scoreResumeForAts } from './modules/resumes/scoring';

const uploadStorage = multer.diskStorage({
  destination: (_request, _file, callback) => callback(null, env.uploadDir),
  filename: (_request, file, callback) => {
    const extension = path.extname(file.originalname);
    callback(null, `${Date.now()}-${randomUUID()}${extension}`);
  },
});

const upload = multer({
  fileFilter: (_request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const typeAllowed = env.allowedUploadTypes.includes(file.mimetype.toLowerCase()) || env.allowedUploadTypes.includes(extension);
    if (typeAllowed) {
      callback(null, true);
      return;
    }
    callback(new HttpError(415, `Unsupported upload type: ${file.mimetype || extension || 'unknown'}`));
  },
  limits: {
    fileSize: env.maxUploadSizeMb * 1024 * 1024,
  },
  storage: uploadStorage,
});

async function recordUpload(file: Express.Multer.File, ownerType: string, ownerId: string | null, extractedText: string) {
  await pool.query(
    `INSERT INTO uploads (id, owner_type, owner_id, original_name, mime_type, size_bytes, storage_path, extracted_text)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [randomUUID(), ownerType, ownerId, file.originalname, file.mimetype, file.size, file.path, extractedText],
  );
}

function asyncRoute(handler: express.RequestHandler): express.RequestHandler {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

function paramId(request: express.Request) {
  return String(request.params.id ?? '');
}

function actorUserId(request: express.Request) {
  const value = request.header('x-user-id');
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function createApp() {
  const app = express();
  app.use(cors({
    credentials: false,
    origin(origin, callback) {
      if (!origin || env.frontendOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new HttpError(403, `Origin not allowed: ${origin}`));
    },
  }));
  app.use(express.json({ limit: '2mb' }));
  app.use('/static/templates', express.static(paths.templateImagesDir));

  app.get('/api/health', asyncRoute(async (_request, response) => {
    const migrationCheck = await pool.query('SELECT COUNT(*)::text AS count FROM schema_migrations');
    response.json({
      aiProvider: env.aiProvider,
      compilerConfigured: Boolean(env.compilerImage),
      ok: true,
      runtime: getTemplateRuntimeMeta(),
      schemaMigrations: Number(migrationCheck.rows[0]?.count ?? 0),
    });
  }));

  app.get('/api/templates', (_request, response) => {
    response.json({
      items: templateRegistry,
      runtime: getTemplateRuntimeMeta(),
    });
  });

  app.get('/api/session', asyncRoute(async (request, response) => {
    const requestedUserId = actorUserId(request);
    const actor = requestedUserId ? await getUserById(requestedUserId) : await getDefaultDevUser();
    response.json({
      actor: actor ? {
        avatarUrl: actor.avatarUrl,
        email: actor.email,
        id: actor.id,
        name: actor.name,
      } : null,
      mode: 'dev',
    });
  }));

  app.get('/api/tips', (_request, response) => {
    response.json({ items: dashboardTips });
  });

  app.get('/api/profile', asyncRoute(async (_request, response) => {
    const userId = actorUserId(_request);
    const [resumeItems, jdItems] = await Promise.all([listResumes(userId), listJds(userId)]);
    response.json({
      summary: getProfileSummary(),
      usage: buildUsageMetrics(resumeItems.length, jdItems.length),
    });
  }));

  app.get('/api/resumes', asyncRoute(async (_request, response) => {
    const resumes = await listResumes(actorUserId(_request));
    response.json({
      items: resumes.map((resume, index) => toResumeSummary(resume, index === 0)),
    });
  }));

  app.post('/api/resumes', asyncRoute(async (request, response) => {
    const userId = actorUserId(request);
    const title = typeof request.body?.title === 'string' && request.body.title.trim()
      ? request.body.title.trim()
      : `resume_${Date.now()}.tex`;
    const templateId = typeof request.body?.templateId === 'string' ? request.body.templateId : 'template1';
    const resume = await createResume({
      content: normalizeResumeData(request.body?.content, 'scratch'),
      rawText: typeof request.body?.rawText === 'string' ? request.body.rawText : '',
      renderOptions: normalizeRenderOptions({ ...request.body?.renderOptions, templateId }),
      source: 'scratch',
      templateId,
      title,
      userId,
    });
    response.status(201).json({
      item: toResumeSummary(resume, true),
      record: resume,
    });
  }));

  app.get('/api/resumes/:id', asyncRoute(async (request, response) => {
    const resume = await getResumeById(paramId(request), actorUserId(request));
    if (!resume) throw new HttpError(404, 'Resume not found.');
    response.json({ record: resume });
  }));

  app.patch('/api/resumes/:id', asyncRoute(async (request, response) => {
    const updated = await updateResume(paramId(request), {
      content: request.body?.content ? normalizeResumeData(request.body.content, 'scratch') : undefined,
      rawText: typeof request.body?.rawText === 'string' ? request.body.rawText : undefined,
      renderOptions: request.body?.renderOptions ? normalizeRenderOptions(request.body.renderOptions) : undefined,
      templateId: typeof request.body?.templateId === 'string' ? request.body.templateId : undefined,
      title: typeof request.body?.title === 'string' ? request.body.title.trim() : undefined,
    }, actorUserId(request));
    if (!updated) throw new HttpError(404, 'Resume not found.');
    response.json({
      item: toResumeSummary(updated, true),
      record: updated,
    });
  }));

  app.delete('/api/resumes/:id', asyncRoute(async (request, response) => {
    const deleted = await deleteResume(paramId(request), actorUserId(request));
    if (!deleted) throw new HttpError(404, 'Resume not found.');
    response.status(204).end();
  }));

  app.post('/api/import/resume', upload.single('file'), asyncRoute(async (request, response) => {
    const userId = actorUserId(request);
    const textBody = typeof request.body?.text === 'string' ? request.body.text.trim() : '';
    const sourceName = typeof request.body?.sourceName === 'string' ? request.body.sourceName : request.file?.originalname ?? 'Imported Resume';

    let extractedText = textBody;
    if (request.file) {
      extractedText = await extractTextFromUpload(request.file);
    }

    const imported = await importResumeFromText(extractedText, sourceName);
    const resume = await createResume({
      content: imported.resume,
      rawText: imported.extractedText,
      renderOptions: imported.renderOptions,
      source: imported.resume.meta.source,
      templateId: imported.renderOptions.templateId,
      title: imported.title,
      userId,
    });

    if (request.file) {
      await recordUpload(request.file, 'resume', resume.id, imported.extractedText);
    }

    response.status(201).json({
      extractedText: imported.extractedText,
      item: toResumeSummary(resume, true),
      parseStatus: imported.parseStatus,
      record: resume,
      resumeId: resume.id,
      warnings: imported.warnings,
    });
  }));

  app.post('/api/resumes/:id/ats-score', asyncRoute(async (request, response) => {
    const resume = await getResumeById(paramId(request), actorUserId(request));
    if (!resume) throw new HttpError(404, 'Resume not found.');
    response.json(scoreResumeForAts(resume.content));
  }));

  app.get('/api/resumes/:id/export/tex', asyncRoute(async (request, response) => {
    const resume = await getResumeById(paramId(request), actorUserId(request));
    if (!resume) throw new HttpError(404, 'Resume not found.');
    response.json(buildTexExportPayload({
      renderOptions: resume.renderOptions,
      resume: resume.content,
      title: resume.title,
    }));
  }));

  app.get('/api/jds', asyncRoute(async (_request, response) => {
    const items = await listJds(actorUserId(_request));
    response.json({ items: items.map(toJdRecord) });
  }));

  app.post('/api/jds', asyncRoute(async (request, response) => {
    const userId = actorUserId(request);
    const text = typeof request.body?.text === 'string' ? request.body.text.trim() : '';
    if (!text) throw new HttpError(400, 'JD text is required.');
    const parsedMeta = deriveJdParsedMeta(text, request.body?.title ?? '');
    const jd = await createJd({
      badge: request.body?.badge,
      company: typeof request.body?.company === 'string' ? request.body.company : parsedMeta.company ?? 'Imported Company',
      parsedMeta,
      rawText: text,
      title: typeof request.body?.title === 'string' && request.body.title.trim() ? request.body.title.trim() : parsedMeta.roleTitle ?? 'Imported JD',
      type: typeof request.body?.type === 'string' ? request.body.type : 'Imported',
      userId,
    });
    response.status(201).json({ item: toJdRecord(jd), record: jd });
  }));

  app.get('/api/jds/:id', asyncRoute(async (request, response) => {
    const jd = await getJdById(paramId(request), actorUserId(request));
    if (!jd) throw new HttpError(404, 'JD not found.');
    response.json({ item: toJdRecord(jd), record: jd });
  }));

  app.patch('/api/jds/:id', asyncRoute(async (request, response) => {
    const rawText = typeof request.body?.text === 'string' ? request.body.text.trim() : undefined;
    const nextParsed = rawText ? deriveJdParsedMeta(rawText, typeof request.body?.title === 'string' ? request.body.title : '') : undefined;
    const jd = await updateJd(paramId(request), {
      badge: typeof request.body?.badge === 'string' ? request.body.badge : undefined,
      company: typeof request.body?.company === 'string' ? request.body.company : undefined,
      parsedMeta: nextParsed,
      rawText,
      title: typeof request.body?.title === 'string' ? request.body.title.trim() : undefined,
      type: typeof request.body?.type === 'string' ? request.body.type : undefined,
    }, actorUserId(request));
    if (!jd) throw new HttpError(404, 'JD not found.');
    response.json({ item: toJdRecord(jd), record: jd });
  }));

  app.delete('/api/jds/:id', asyncRoute(async (request, response) => {
    const deleted = await deleteJd(paramId(request), actorUserId(request));
    if (!deleted) throw new HttpError(404, 'JD not found.');
    response.status(204).end();
  }));

  app.post('/api/import/jd', upload.single('file'), asyncRoute(async (request, response) => {
    const userId = actorUserId(request);
    const textBody = typeof request.body?.text === 'string' ? request.body.text.trim() : '';
    let extractedText = textBody;
    if (request.file) {
      extractedText = await extractTextFromUpload(request.file);
    }
    if (!extractedText) throw new HttpError(400, 'JD text is required.');
    const sourceName = typeof request.body?.sourceName === 'string' ? request.body.sourceName : request.file?.originalname ?? 'Imported JD';
    const parsedMeta = deriveJdParsedMeta(extractedText, sourceName);
    const jd = await createJd({
      badge: 'Newly added',
      company: parsedMeta.company ?? 'Imported Company',
      parsedMeta,
      rawText: extractedText,
      title: parsedMeta.roleTitle ?? 'Imported JD',
      type: 'Imported',
      userId,
    });
    if (request.file) {
      await recordUpload(request.file, 'jd', jd.id, extractedText);
    }
    response.status(201).json({ extractedText, item: toJdRecord(jd), record: jd });
  }));

  app.post('/api/jds/:id/match-score', asyncRoute(async (request, response) => {
    const userId = actorUserId(request);
    const jd = await getJdById(paramId(request), userId);
    if (!jd) throw new HttpError(404, 'JD not found.');
    const resumeId = typeof request.body?.resumeId === 'string' ? request.body.resumeId : '';
    const resume = await getResumeById(resumeId, userId);
    if (!resume) throw new HttpError(404, 'Resume not found.');
    response.json({
      jd: toJdRecord(jd),
      report: scoreResumeAgainstJd(resume.content, jd.parsedMeta),
      resume: toResumeSummary(resume, false),
    });
  }));

  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    if (error instanceof HttpError) {
      response.status(error.statusCode).json({ error: error.message });
      return;
    }
    if (error instanceof multer.MulterError) {
      response.status(400).json({ error: error.message });
      return;
    }
    response.status(500).json({ error: error instanceof Error ? error.message : 'Unexpected server error.' });
  });

  return app;
}
