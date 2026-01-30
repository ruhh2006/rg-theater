export default function Legal() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-extrabold">Legal / Terms</h1>
      <p className="mt-2 text-white/70 text-sm">
        RG Theater — Creator first OTT platform (MVP terms).
      </p>

      <div className="mt-6 max-w-3xl space-y-6 text-white/75 text-sm leading-relaxed">
        <section className="border border-white/10 bg-white/5 rounded-2xl p-5">
          <h2 className="text-xl font-bold text-white">1) Terms of Use</h2>
          <ul className="mt-3 space-y-2">
            <li>• Users must not upload or share pirated content.</li>
            <li>• Creators must upload only ORIGINAL content or content with valid streaming rights.</li>
            <li>• We may remove content or suspend accounts for violations.</li>
            <li>• Premium access depends on subscription status.</li>
          </ul>
        </section>

        <section className="border border-white/10 bg-white/5 rounded-2xl p-5">
          <h2 className="text-xl font-bold text-white">2) Copyright / DMCA-style Notice</h2>
          <p className="mt-3">
            If you believe content infringes your copyright, use the “Report” button on the Watch page.
            We will review and may remove/disable access quickly.
          </p>
        </section>

        <section className="border border-white/10 bg-white/5 rounded-2xl p-5">
          <h2 className="text-xl font-bold text-white">3) Privacy</h2>
          <ul className="mt-3 space-y-2">
            <li>• We store user email (via Supabase auth) and content metadata for platform operation.</li>
            <li>• We do not sell your personal data.</li>
            <li>• Videos are stored securely and served via signed URLs.</li>
          </ul>
        </section>

        <section className="border border-white/10 bg-white/5 rounded-2xl p-5">
          <h2 className="text-xl font-bold text-white">4) Contact</h2>
          <p className="mt-3">
            For urgent issues, use the “Report” feature. This is an early MVP.
          </p>
        </section>
      </div>
    </div>
  );
}
