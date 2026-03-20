// Relative modules.
import Footer from "@/components/Footer";
import HeadTag from "@/components/HeadTag";
import Navbar from "@/components/Navbar";

const TermsOfService = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-100 text-gray-700 dark:bg-neutral-800 dark:text-white">
      <HeadTag
        metaDescription="UrantiaHub Terms of Service - Read the terms and conditions for using UrantiaHub."
        titlePrefix="Terms of Service"
      />
      <Navbar />
      <main className="mt-8 flex-grow container mx-auto px-4 my-4 mb-8 max-w-3xl">
        <section className="space-y-6">
          <h1 className="text-3xl font-bold text-center">Terms of Service</h1>
          <p className="text-gray-400 text-center">
            Last updated: March 20, 2026
          </p>

          <div className="text-left space-y-6">
            <h2 className="text-2xl font-bold">Agreement to Terms</h2>
            <p>
              These Terms of Service constitute a legally binding agreement
              between you and Adams Technologies LLC, doing business as
              UrantiaHub (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), a
              Texas limited liability company. By accessing or using
              urantiahub.com or any related services (collectively, the
              &quot;Services&quot;), you agree to be bound by these terms.
            </p>
            <p>
              If you do not agree with these terms, you must discontinue use
              immediately.
            </p>

            <div className="p-4 border border-gray-600 rounded-lg">
              <h3 className="font-semibold mb-2">Disclaimer of Affiliation</h3>
              <p>
                UrantiaHub is an independent community project. It is not
                affiliated with, endorsed by, sponsored by, or officially
                connected with Urantia Foundation. The original English text of
                The Urantia Book entered the public domain in 2006. Audio
                narrations and translations available through our services are
                independently produced derivative works. All use of the word
                &quot;Urantia&quot; on our services is for descriptive,
                nominative purposes to identify the subject matter.
              </p>
            </div>

            <h2 className="text-2xl font-bold">1. Our Services</h2>
            <p>
              UrantiaHub provides a reading, study, and community platform for
              The Urantia Book, including full-text search, bookmarks, notes,
              AI-powered explanations, audio narration, and related features.
              Paper content is served via the Urantia Papers API (api.urantia.dev).
            </p>
            <p>
              The services are intended for users who are at least 18 years old.
            </p>

            <h2 className="text-2xl font-bold">2. User Accounts</h2>
            <p>
              You may need to register to use certain features. You agree to
              provide accurate information and keep your credentials
              confidential. You are responsible for all activity under your
              account. We reserve the right to suspend or terminate accounts that
              violate these terms.
            </p>

            <h2 className="text-2xl font-bold">3. Intellectual Property</h2>

            <h3 className="text-lg font-semibold">Our content:</h3>
            <p>
              We own or license all intellectual property in our services,
              including source code, designs, features, and original content
              (excluding The Urantia Book text, which is in the public domain).
              Our services are provided for your personal, non-commercial use.
            </p>

            <h3 className="text-lg font-semibold">Your content:</h3>
            <p>
              You retain ownership of content you create (notes, bookmarks,
              etc.). By posting content through our services, you grant us a
              non-exclusive, worldwide, royalty-free license to use, display, and
              distribute that content as necessary to operate the services.
            </p>

            <h3 className="text-lg font-semibold">The Urantia Book:</h3>
            <p>
              The original English text of The Urantia Book is in the public
              domain. Our presentation, formatting, and supplementary materials
              (AI explanations, audio narrations, curated collections) are
              original works.
            </p>

            <h2 className="text-2xl font-bold">4. Prohibited Activities</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Use the services for any unlawful purpose</li>
              <li>
                Attempt to gain unauthorized access to our systems
              </li>
              <li>Interfere with or disrupt the services</li>
              <li>
                Scrape, copy, or redistribute our proprietary content without
                permission
              </li>
              <li>Impersonate another user or entity</li>
              <li>Use the services to harass, abuse, or harm others</li>
              <li>
                Use automated systems to access the services without our written
                consent
              </li>
            </ul>

            <h2 className="text-2xl font-bold">5. AI Features</h2>
            <p>
              Our AI-powered features (passage explanations, search) use
              third-party language models. AI-generated content is provided for
              informational and educational purposes only and should not be
              considered authoritative religious or spiritual guidance. We do not
              guarantee the accuracy of AI-generated responses.
            </p>

            <h2 className="text-2xl font-bold">6. Third-Party Services</h2>
            <p>
              Our services may link to or integrate with third-party services
              (Google OAuth, audio CDN, etc.). We are not responsible for the
              content, privacy practices, or availability of third-party
              services.
            </p>

            <h2 className="text-2xl font-bold">7. Disclaimer of Warranties</h2>
            <p className="uppercase font-semibold">
              The services are provided &quot;as is&quot; and &quot;as
              available&quot; without warranties of any kind, express or implied.
              We do not warrant that the services will be uninterrupted, secure,
              or error-free.
            </p>

            <h2 className="text-2xl font-bold">8. Limitation of Liability</h2>
            <p className="uppercase font-semibold">
              To the maximum extent permitted by law, Adams Technologies LLC and
              its members, employees, and agents shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages
              arising from your use of the services.
            </p>

            <h2 className="text-2xl font-bold">9. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Adams Technologies LLC
              from any claims, damages, or expenses arising from your use of the
              services, your content, or your violation of these terms.
            </p>

            <h2 className="text-2xl font-bold">10. Governing Law</h2>
            <p>
              These terms are governed by the laws of the State of Texas, United
              States. Any disputes shall be resolved in the courts of Travis
              County, Texas, unless otherwise required by applicable law.
            </p>

            <h2 className="text-2xl font-bold">
              11. Changes to These Terms
            </h2>
            <p>
              We may update these terms from time to time. Material changes will
              be communicated via email or prominent notice on the services.
              Continued use after changes constitutes acceptance.
            </p>

            <h2 className="text-2xl font-bold">12. Contact Us</h2>
            <p>
              For questions about these terms, contact us at:
            </p>
            <p>
              Adams Technologies LLC
              <br />
              DBA UrantiaHub
              <br />
              Email:{" "}
              <a
                href="mailto:team@urantiahub.com"
                className="text-blue-400 hover:underline"
              >
                team@urantiahub.com
              </a>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
