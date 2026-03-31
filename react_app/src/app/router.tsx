import { createBrowserRouter, Navigate } from 'react-router-dom';
import { routes } from 'lib/routes';
import { RootLayout } from 'layouts/RootLayout';
import { PublicLayout } from 'layouts/PublicLayout';
import { WorkspaceLayout } from 'layouts/WorkspaceLayout';
import { EditorLayout } from 'layouts/EditorLayout';
import { HomePage } from 'pages/public/HomePage';
import { AboutPage } from 'pages/public/AboutPage';
import { NotFoundPage } from 'pages/public/NotFoundPage';
import { Error500Page } from 'pages/public/Error500Page';
import { DashboardPage } from 'pages/workspace/DashboardPage';
import { ResumesPage } from 'pages/workspace/ResumesPage';
import { JdsPage } from 'pages/workspace/JdsPage';
import { EditorPage } from 'pages/workspace/EditorPage';
import { ProfilePage } from 'pages/workspace/ProfilePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: routes.about, element: <AboutPage /> },
          { path: routes.notFound, element: <NotFoundPage /> },
          { path: routes.error500, element: <Error500Page /> },
        ],
      },
      {
        element: <WorkspaceLayout />,
        children: [
          { path: routes.dashboard, element: <DashboardPage /> },
          { path: routes.resumes, element: <ResumesPage /> },
          { path: routes.jds, element: <JdsPage /> },
          { path: routes.profile, element: <ProfilePage /> },
        ],
      },
      {
        element: <EditorLayout />,
        children: [{ path: routes.editor, element: <EditorPage /> }],
      },
      {
        path: '*',
        element: <Navigate to={routes.notFound} replace />,
      },
    ],
  },
]);
