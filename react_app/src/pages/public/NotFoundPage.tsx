import { PublicErrorState } from 'components/public/PublicErrorState';
import { routes } from 'lib/routes';

export function NotFoundPage() {
  return (
    <PublicErrorState
      code="404"
      label="Error 404"
      title="That page wandered off."
      description="The page slipped out of the map, but the rest of meowfolio is still right where you left it."
      glowClass="bg-primary/12"
      iconClass="bg-primary-fixed text-primary"
      badgeClass="border-primary/35 bg-primary-fixed text-primary"
      actions={[
        { label: 'Back Home', to: routes.home },
        { label: 'Read About', to: routes.about, variant: 'secondary' },
      ]}
    />
  );
}
