/**
 * Action bar widget content wrapper.
 * 操作栏 Widget 内容包装组件。
 */

import ActionBar from '../sections/ActionBar';

export default function ActionBarWidgetContent() {
  return (
    <div className="p-3 max-h-[60vh] overflow-y-auto dock-scrollbar">
      <ActionBar />
    </div>
  );
}
