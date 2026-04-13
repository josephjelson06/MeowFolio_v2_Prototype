import { RouterProvider } from 'react-router-dom';
import { router } from 'app/router';
import { SessionProvider } from 'state/session/sessionContext';
import { UiProvider } from 'state/ui/uiContext';

export function App() {
  return (
    <SessionProvider>
      <UiProvider>
        <RouterProvider router={router} />
      </UiProvider>
    </SessionProvider>
  );
}
