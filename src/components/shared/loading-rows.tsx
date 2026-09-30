export function LoadingRows({ count }: { count: number }) {
  return Array.from({ length: count }, (_, index) => <div className="skeleton loading-row" key={index} />);
}
