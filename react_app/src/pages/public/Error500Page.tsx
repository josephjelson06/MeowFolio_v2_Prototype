import { PublicErrorState } from 'components/public/PublicErrorState';
import { routes } from 'lib/routes';

export function Error500Page() {
  return (
    <PublicErrorState
      code="500"
      label="Error 500"
      title="The workspace hit a temporary snag."
      description="Something broke on the way through the product loop. The structure is still here, but this screen couldn't finish loading cleanly."
      glowClass="bg-[color:var(--warn)]/12"
      iconClass="bg-[color:var(--warn-bg)] text-[color:var(--warn)]"
      badgeClass="border-[color:var(--warn)]/35 bg-[color:var(--warn-bg)] text-[color:var(--warn)]"
      actions={[
        { label: 'Back Home', to: routes.home },
        { label: 'Go to Dashboard', to: routes.dashboard, variant: 'secondary' },
      ]}
    />
  );
}
