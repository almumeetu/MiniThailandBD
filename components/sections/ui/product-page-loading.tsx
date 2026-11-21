import styles from './product-experience.module.css';

export default function ProductPageLoading() {
  return (
    <div role="status" aria-label="Loading product details" className={`${styles.loading} mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 md:px-10 lg:px-16 lg:py-12`}>
      <span className="sr-only">Preparing your product…</span>
      <div aria-hidden="true" className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-4">
          <div className={`${styles.shimmer} aspect-square max-h-[560px] rounded-[3px]`} />
          <div className="flex gap-3">{[0, 1, 2].map(i => <div key={i} className={`${styles.shimmer} h-18 w-18 rounded-[3px]`} />)}</div>
        </div>
        <div className="space-y-6 rounded-[3px] border border-[#e6dfd4] bg-white p-7 sm:p-9">
          <div className={`${styles.shimmer} h-2 w-28 rounded`} />
          <div className="space-y-3"><div className={`${styles.shimmer} h-8 w-full rounded-lg`} /><div className={`${styles.shimmer} h-8 w-2/3 rounded-lg`} /></div>
          <div className={`${styles.shimmer} h-3 w-24 rounded`} />
          <div className={`${styles.shimmer} h-20 w-full rounded-xl`} />
          <div className={`${styles.shimmer} h-12 w-full rounded-xl`} />
          <div className="grid grid-cols-2 gap-3"><div className={`${styles.shimmer} h-12 rounded-xl`} /><div className={`${styles.shimmer} h-12 rounded-xl`} /></div>
        </div>
      </div>
    </div>
  );
}
