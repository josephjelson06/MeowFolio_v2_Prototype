import { Outlet } from 'react-router-dom';
import { AuthModalHost } from 'modals/AuthModalHost';
import { ResumeModalHost } from 'modals/ResumeModalHost';
import { JdModalHost } from 'modals/JdModalHost';

export function RootLayout() {
  return (
    <>
      <Outlet />
      <AuthModalHost />
      <ResumeModalHost />
      <JdModalHost />
    </>
  );
}
