import { ComponentType, lazy, memo, Suspense } from 'react';
import { NavLink, Route, Switch } from 'react-router-dom';
import { Loading } from '@components';

const context = import.meta.glob<{ default: ComponentType }>('./*.tsx');
const Modules = Object.keys(context)
  .filter((dir) => dir !== './index.tsx')
  .map(
    (dir) => {
      const name = dir.slice(2).replace(/\.tsx$/, '');
      return {
        dir,
        name,
        component: lazy(context[dir]),
      };
    },
    {} as {
      [key: string]: {
        dir: string;
        component: Parameters<typeof lazy>;
      };
    }
  );

function Playground() {
  return (
    <div>
      <div className="sticky top-0 h-screen overscroll-none overflow-auto no-scrollbar float-left hidden w-40 s768:block bg-layer1">
        {Modules.map((module) => {
          return (
            <NavLink
              className="block p-2 cursor-pointer"
              activeClassName="text-brand font-700"
              key={module.name}
              to={`/playground/${module.name}`}
            >
              {module.name}
            </NavLink>
          );
        })}
      </div>
      <div className="relative min-h-screen p-4 overflow-auto bg-layer2">
        <Suspense fallback={<Loading />}>
          <Switch>
            {Modules.map((module) => {
              return <Route key={module.name} path={`/playground/${module.name}`} component={module.component} />;
            })}
          </Switch>
        </Suspense>
      </div>
    </div>
  );
}

export default memo(Playground);
