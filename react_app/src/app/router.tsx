import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { routes } from 'lib/routes';
import { HomePage } from 'pages/public/HomePage';
import { AboutPage } from 'pages/public/AboutPage';
import { NotFoundPage } from 'pages/public/NotFoundPage';
import { Error500Page } from 'pages/public/Error500Page';
import { DashboardPage } from 'pages/workspace/DashboardPage';
import { ResumesPage } from 'pages/workspace/ResumesPage';
import { JdsPage } from 'pages/workspace/JdsPage';
import { EditorPage } from 'pages/workspace/EditorPage';
import { ProfilePage } from 'pages/workspace/ProfilePage';
import { AuthModalHost } from 'modals/AuthModalHost';
import { ResumeModalHost } from 'modals/ResumeModalHost';
import { JdModalHost } from 'modals/JdModalHost';

function AppShell() {
  return (
    <>
      <Outlet />
      <AuthModalHost />
      <ResumeModalHost />
      <JdModalHost />
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
