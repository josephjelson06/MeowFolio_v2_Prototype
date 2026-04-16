import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { routes } from 'app/router/routes';
import { HomePage } from 'pages/public/HomePage';
import { AboutPage } from 'pages/public/AboutPage';
import { NotFoundPage } from 'pages/public/NotFoundPage';
import { Error500Page } from 'pages/public/Error500Page';
import { AuthCallbackPage } from 'pages/public/AuthCallbackPage';
import { DashboardPage } from 'pages/workspace/DashboardPage';
import { ResumesPage } from 'pages/workspace/ResumesPage';
import { JdsPage } from 'pages/workspace/JdsPage';
import { EditorPage } from 'pages/workspace/EditorPage';
import { ProfilePage } from 'pages/workspace/ProfilePage';
import { AuthModalHost } from 'modals/AuthModalHost';
import { ResumeModalHost } from 'modals/ResumeModalHost';
import { JdModalHost } from 'modals/JdModalHost';
import { ResumeRenameModalHost } from 'modals/resumes/ResumeRenameModalHost';
import { ResumeDeleteModalHost } from 'modals/resumes/ResumeDeleteModalHost';
import { JdRenameModalHost } from 'modals/jds/JdRenameModalHost';
import { JdDeleteModalHost } from 'modals/jds/JdDeleteModalHost';
import { LogoutConfirmModalHost } from 'modals/session/LogoutConfirmModalHost';

function AppShell() {
  return (
    <>
      <Outlet />
      <AuthModalHost />
      <ResumeModalHost />
      <JdModalHost />
      <ResumeRenameModalHost />
      <ResumeDeleteModalHost />
      <JdRenameModalHost />
      <JdDeleteModalHost />
      <LogoutConfirmModalHost />
    </>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: routes.about, element: <AboutPage /> },
      { path: routes.notFound, element: <NotFoundPage /> },
      { path: routes.error500, element: <Error500Page /> },
      { path: routes.authCallback, element: <AuthCallbackPage /> },
      { path: routes.dashboard, element: <DashboardPage /> },
      { path: routes.resumes, element: <ResumesPage /> },
      { path: routes.jds, element: <JdsPage /> },
      { path: routes.profile, element: <ProfilePage /> },
      { path: routes.editor, element: <EditorPage /> },
      {
        path: '*',
        element: <Navigate to={routes.notFound} replace />,
      },
    ],
  },
]);
