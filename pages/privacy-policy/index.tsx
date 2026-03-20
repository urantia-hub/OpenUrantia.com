// Relative modules.
import Footer from "@/components/Footer";
import HeadTag from "@/components/HeadTag";
import Navbar from "@/components/Navbar";

const PrivacyPolicy = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-100 text-gray-700 dark:bg-neutral-800 dark:text-white">
      <HeadTag
        metaDescription="UrantiaHub Privacy Policy - Learn how we collect, use, and protect your personal information."
        titlePrefix="Privacy Policy"
      />
      <Navbar />
      <main className="mt-8 flex-grow container mx-auto px-4 my-4 mb-8 max-w-3xl">
        <section className="space-y-6">
          <h1 className="text-3xl font-bold text-center">Privacy Policy</h1>
          <p className="text-gray-400 text-center">Last updated: March 20, 2026</p>

          <div className="text-left space-y-6">
            <p>
              This privacy notice for Adams Technologies LLC, doing business as
              UrantiaHub (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;),
              describes how and why we might collect, store, use, and/or share
              your information when you use our services, including when you
              visit urantiahub.com or any website or application of ours that
              links to this privacy notice.
            </p>
            <p>
              If you have questions or concerns, please contact us at{" "}
              <a
                href="mailto:team@urantiahub.com"
                className="text-blue-400 hover:underline"
              >
                team@urantiahub.com
              </a>
              .
            </p>

            <div className="p-4 border border-gray-600 rounded-lg">
              <h3 className="font-semibold mb-2">Disclaimer</h3>
              <p>
                UrantiaHub is an independent community project operated by Adams
                Technologies LLC, a Texas limited liability company. It is not
                affiliated with, endorsed by, sponsored by, or officially
                connected with Urantia Foundation. The Urantia Book text is in
                the public domain.
              </p>
            </div>

            <h2 className="text-2xl font-bold">1. Information We Collect</h2>

            <h3 className="text-lg font-semibold">
              Information you provide to us:
            </h3>
            <p>
              We collect personal information that you voluntarily provide when
              you register on our services, including:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Names</li>
              <li>Email addresses</li>
              <li>Account preferences and settings</li>
            </ul>

            <h3 className="text-lg font-semibold">
              Information collected automatically:
            </h3>
            <p>
              When you visit our services, we automatically collect certain
              information including your IP address, browser and device
              characteristics, operating system, referring URLs, and information
              about how you use our services. This information is primarily
              needed for security, analytics, and improving our services.
            </p>

            <h3 className="text-lg font-semibold">Social media login data:</h3>
            <p>
              We offer the option to register using Google OAuth. If you choose
              this method, we receive your name, email address, and profile
              picture from Google.
            </p>

            <h2 className="text-2xl font-bold">
              2. How We Use Your Information
            </h2>
            <p>We process your information to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Facilitate account creation and authentication</li>
              <li>Deliver and improve our services</li>
              <li>Respond to inquiries and provide support</li>
              <li>
                Send administrative information (service updates, security
                alerts)
              </li>
              <li>
                Send optional communications (daily quotes, reading reminders)
                based on your preferences
              </li>
              <li>Monitor and analyze usage trends</li>
              <li>Protect our services from fraud and abuse</li>
            </ul>

            <h2 className="text-2xl font-bold">
              3. How We Share Your Information
            </h2>
            <p>
              We do not sell your personal information. We may share information
              with:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                Service providers who assist in operating our services (hosting,
                analytics, email delivery)
              </li>
              <li>As required by law or to protect our legal rights</li>
              <li>
                In connection with a business transfer, merger, or acquisition
              </li>
            </ul>

            <h2 className="text-2xl font-bold">4. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to maintain your session,
              remember preferences, and analyze usage. You can control cookies
              through your browser settings.
            </p>

            <h2 className="text-2xl font-bold">5. Data Retention</h2>
            <p>
              We keep your personal information for as long as necessary to
              fulfill the purposes outlined in this notice, unless a longer
              retention period is required by law. When you delete your account,
              we will delete or anonymize your personal information.
            </p>

            <h2 className="text-2xl font-bold">6. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security
              measures to protect your information. However, no electronic
              transmission or storage technology is 100% secure, and we cannot
              guarantee absolute security.
            </p>

            <h2 className="text-2xl font-bold">7. Your Privacy Rights</h2>
            <p>
              Depending on your location, you may have the right to:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Access, correct, or delete your personal information</li>
              <li>Withdraw consent for optional data processing</li>
              <li>Object to the processing of your personal information</li>
              <li>Request a copy of your data in a portable format</li>
              <li>Opt out of marketing communications at any time</li>
            </ul>
            <p>
              To exercise these rights, contact us at{" "}
              <a
                href="mailto:team@urantiahub.com"
                className="text-blue-400 hover:underline"
              >
                team@urantiahub.com
              </a>{" "}
              or use the account settings within the application.
            </p>

            <h3 className="text-lg font-semibold">California residents:</h3>
            <p>
              Under the CCPA, you have additional rights including the right to
              know what personal information we collect, request deletion, and
              opt out of the sale of personal information. We do not sell
              personal information.
            </p>

            <h3 className="text-lg font-semibold">European residents:</h3>
            <p>
              Under the GDPR, we process your information based on consent,
              contractual necessity, and legitimate interests. You have the right
              to lodge a complaint with your local data protection authority.
            </p>

            <h2 className="text-2xl font-bold">
              8. International Data Transfers
            </h2>
            <p>
              Our services are hosted in the United States. If you access our
              services from outside the United States, your information will be
              transferred to and processed in the United States. By using our
              services, you consent to this transfer.
            </p>

            <h2 className="text-2xl font-bold">9. Children</h2>
            <p>
              We do not knowingly collect data from or market to children under
              18 years of age. If we learn that we have collected information
              from a minor, we will delete that information promptly.
            </p>

            <h2 className="text-2xl font-bold">
              10. Updates to This Notice
            </h2>
            <p>
              We may update this privacy notice from time to time. The updated
              version will be indicated by an updated date at the top of this
              page. We encourage you to review this notice periodically.
            </p>

            <h2 className="text-2xl font-bold">11. Contact Us</h2>
            <p>
              If you have questions about this privacy notice or wish to
              exercise your rights, contact us at:
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

export default PrivacyPolicy;
