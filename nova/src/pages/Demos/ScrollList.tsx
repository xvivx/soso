import ScrollList from '@components/ScrollList';

export default function ScrollListDemo() {
  return (
    <ScrollList size="sm">
      {new Array(30).fill(1).map((_, index) => {
        return (
          <div
            key={index}
            className="w-30 odd:w-60 shrink-0 text-center px-6 border-r border-layer5 last-of-type:border-none"
          >
            <div className="bg-layer2">{index}</div>
          </div>
        );
      })}
    </ScrollList>
  );
}
