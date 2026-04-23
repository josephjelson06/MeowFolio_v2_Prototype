import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from 'app/router';
import { SessionProvider } from 'state/session/sessionContext';
import { UiProvider } from 'state/ui/uiContext';
import { startKeepAlive } from 'lib/keepAlive';

export function App() {
  // Start the Render keep-alive ping scheduler on app boot
  useEffect(() => {
    const stop = startKeepAlive();
    return stop;
  }, []);

  return (
    <SessionProvider>
      <UiProvider>
        <RouterProvider router={router} />
      </UiProvider>
    </SessionProvider>
  );
}
