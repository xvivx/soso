import { Loading } from '@components';

export default function LoadingDemo() {
  return (
    <div className="space-y-8">
      <div className="relative h-100">
        <Loading />
      </div>

      <Loading.Screen />
    </div>
  );
}
