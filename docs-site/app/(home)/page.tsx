import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col justify-center text-center flex-1">
      <h1 className="text-2xl font-bold mb-4">yashas / docs</h1>
      <p>
        Documentation for every product. Open{' '}
        <Link href="/docs" className="font-medium underline">
          the docs
        </Link>{' '}
        to browse them.
      </p>
    </div>
  );
}
