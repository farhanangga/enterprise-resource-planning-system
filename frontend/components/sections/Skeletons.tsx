/** Placeholder saat Hero dan About menunggu data dari API */

export function HeroSkeleton() {
  return (
    <header
      aria-busy="true"
      aria-label="Loading"
      className="grid bg-white lg:h-[100svh] lg:max-h-[880px] lg:min-h-[600px] lg:grid-cols-[3fr_2fr]"
    >
      <div className="flex flex-col rounded-b-[28px] bg-[#ff9d66] px-5 pb-8 pt-5 sm:px-10 lg:mb-10 lg:rounded-b-none lg:rounded-br-[44px] lg:px-14 lg:pt-7">
        <div className="h-5 w-20 animate-pulse rounded-full bg-[#1f1218]/20" />
        <div className="my-auto grid gap-4 pt-10 lg:py-3">
          <div className="h-14 w-4/5 animate-pulse rounded-2xl bg-[#1f1218]/15 sm:h-16" />
          <div className="h-14 w-full animate-pulse rounded-2xl bg-[#1f1218]/15 sm:h-16" />
          <div className="h-14 w-2/5 animate-pulse rounded-2xl bg-[#1f1218]/15 sm:h-16" />
          <div className="mt-2 h-4 w-3/4 animate-pulse rounded-full bg-white/40" />
          <div className="h-4 w-1/2 animate-pulse rounded-full bg-white/40" />
        </div>
      </div>
      <div className="hidden items-end justify-center px-10 lg:flex">
        <div className="h-[58%] w-[70%] animate-pulse rounded-t-[44px] bg-[#1f1218]/10" />
      </div>
    </header>
  );
}

export function AboutSkeleton() {
  return (
    <section aria-busy="true" aria-label="Loading" className="bg-white px-6 py-20 sm:px-10 lg:px-14 lg:py-28">
      <div className="mx-auto w-full max-w-[1180px]">
        <div className="mb-10 grid max-w-[44rem] gap-3">
          <div className="h-10 w-3/4 animate-pulse rounded-2xl bg-[#1f1218]/10" />
          <div className="h-4 w-full animate-pulse rounded-full bg-[#1f1218]/10" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-[28px] bg-[#ff9d66]/40" />
          ))}
        </div>
      </div>
    </section>
  );
}
