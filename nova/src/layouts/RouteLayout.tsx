import { memo, ReactNode, Suspense } from 'react';
import useNavigate from '@hooks/useNavigate';
import { Loading, SvgIcon } from '@components';

/**
 * @interface Props
 * @description RouteLayout组件的属性接口
 */
interface Props {
  /** 页面标题 */
  title: string;
  /** 子组件内容 */
  children: ReactNode;
  /** PC端是否显示返回按钮，默认false (移动端固定显示返回按钮) */
  back?: boolean;
}

/**
 * @component RouteLayout
 * @description 通用的二级页面布局组件，提供响应式布局支持
 * - 移动端：固定显示返回按钮，使用默认返回事件
 * - PC端：可配置是否显示返回按钮，支持自定义返回事件
 */
function RouteLayout(props: Props) {
  const { title, children, back = false } = props;
  const navigate = useNavigate();

  return (
    <div>
      {/* 桌面端标题区域 */}
      <div className="flex items-center mb-6 text-primary text-16">
        {back && <SvgIcon name="arrow" className="-ml-1 rotate-180 size-7" onClick={() => navigate(-1)} />}
        <div className="flex items-center gap-1 text-18">{title}</div>
      </div>

      {/* 桌面端内容区域 */}
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </div>
  );
}

export default memo(RouteLayout);
