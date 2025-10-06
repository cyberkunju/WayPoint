import { useKV } from '@github/spark/hooks';
import { Button } from './ui/button';

export function SimpleTest() {
  const [count, setCount] = useKV<number>('test-counter', 0);

  const increment = () => {
    console.log('Incrementing count, current:', count);
    setCount(current => (current ?? 0) + 1);
  };

  const decrement = () => {
    console.log('Decrementing count, current:', count);
    setCount(current => (current ?? 0) - 1);
  };

  return (
    <div className="fixed top-4 right-4 bg-card border border-border p-4 rounded-lg shadow-lg z-50">
      <div className="text-sm font-medium mb-2">Simple Test</div>
      <div className="text-lg font-bold mb-4">Count: {count ?? 0}</div>
      <div className="flex gap-2">
        <Button size="sm" onClick={increment}>+</Button>
        <Button size="sm" onClick={decrement}>-</Button>
      </div>
    </div>
  );
}