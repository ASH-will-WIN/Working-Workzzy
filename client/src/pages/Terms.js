import React from "react";
import { useNavigate } from "react-router-dom";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-slate-900/50 backdrop-blur-md rounded-2xl p-8 border border-slate-700 shadow-xl">
        <h1 className="text-3xl font-bold mb-8 text-white border-b border-slate-700 pb-4">
          Terms and Conditions
        </h1>

        <div className="prose prose-invert prose-lg max-w-none">
          <h2 className="text-xl font-semibold mt-6 mb-2 text-wurkzi-400">
            1. Acceptance of Terms
          </h2>
          <p className="text-slate-400 mb-4">
            By accessing or using Workzy (“we,” “our,” the platform”), you agree
            to be bound by these Terms and Conditions. If you do not agree, you
            may not use the platform.
          </p>

          <hr className="my-6 border-slate-700" />

          <h2 className="text-xl font-semibold mt-6 mb-2 text-wurkzi-400">
            2. End User License Agreement (EULA) & Objectionable Content
          </h2>
          <p className="text-slate-400 mb-4">
            As a user of Wurkzi, you agree to our <strong>Zero Tolerance Policy</strong> regarding objectionable content and abusive behavior.
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-slate-400">
            <li>You will not post content that is offensive, insensitive, upsetting, intended to disgust, or in exceptionally poor taste.</li>
            <li>You will not engage in harassment, bullying, or abusive behavior towards other users.</li>
            <li>You will not post content that is pornographic, hate speech, or incites violence.</li>
          </ul>
          <p className="text-slate-400 mb-4">
            <strong>Enforcement:</strong> Users found violating this policy will have their content removed immediately and will be <strong>permanently banned</strong> from the platform.
            Users can report objectional content or behavior via the "Report" function on job posts or by contacting support.
            We will act on all reports of objectionable content within 24 hours by removing the content and ejecting the user who provided the offending content.
          </p>

          <hr className="my-6 border-slate-700" />

          <h2 className="text-xl font-semibold mt-6 mb-2 text-wurkzi-400">
            3. Platform Overview
          </h2>
          <p className="text-slate-400 mb-4">
            Workzy connects clients with local teen service providers aged 15+
            for tasks such as car detailing, lawn care, babysitting, and other
            non-specialized work. We are a facilitator, not an employer or
            contractor.
          </p>

          <hr className="my-6 border-slate-700" />

          <h2 className="text-xl font-semibold mt-6 mb-2 text-white border-b border-slate-700 pb-2">
            SECTION I: TEEN WORKERS
          </h2>

          <h3 className="text-lg font-semibold mt-4 mb-2 text-white">3. Eligibility</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-slate-400">
            <li>
              Teen workers must be 15+ years old and have parental or
              legal guardian consent to register and accept jobs.
            </li>
            <li>
              Teens under the age of 18 may not accept jobs that exceed the scope
              of safe, supervised, or age-appropriate labor (no power tools,
              driving, hazardous chemicals, etc.).
            </li>
          </ul>

          <h3 className="text-lg font-semibold mt-4 mb-2 text-white">
            4. Independent Engagement
          </h3>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-slate-400">
            <li>
              Teens are not employees of Workzy. They operate as independent
              agents.
            </li>
            <li>
              Workzy does not direct, supervise, or control how tasks are
              performed.
            </li>
          </ul>

          <h3 className="text-lg font-semibold mt-4 mb-2 text-white">5. Responsibility</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-slate-400">
            <li>
              Teen workers and their parents assume full responsibility for:
              <ul className="list-circle pl-6 mt-2 space-y-1">
                <li>Timeliness and completion of tasks</li>
                <li>Quality of work performed</li>
                <li>Compliance with any applicable local labor laws</li>
                <li>Taxes (if required)</li>
              </ul>
            </li>
          </ul>

          <h3 className="text-lg font-semibold mt-4 mb-2 text-white">6. Code of Conduct</h3>
          <p className="mb-2 text-slate-400">Teen workers agree to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-slate-400">
            <li>Be respectful and professional</li>
            <li>Never enter a client’s home without explicit permission</li>
            <li>Refuse unsafe or illegal tasks</li>
          </ul>
          <p className="mt-2 text-slate-400">
            Violation of this policy may result in account suspension or
            termination.
          </p>

          <hr className="my-6 border-slate-700" />

          <h2 className="text-xl font-semibold mt-6 mb-2 text-white border-b border-slate-700 pb-2">
            SECTION II: PARENTS / LEGAL GUARDIANS
          </h2>

          <h3 className="text-lg font-semibold mt-4 mb-2 text-white">
            7. Consent & Oversight
          </h3>
          <p className="mb-2 text-slate-400">By approving a teen’s registration, you:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-slate-400">
            <li>Grant permission for them to accept and perform jobs</li>
            <li>
              Assume full liability for their conduct, injuries, or damages caused
            </li>
            <li>
              Agree to monitor their activity and ensure they perform only safe,
              appropriate tasks
            </li>
          </ul>

          <h3 className="text-lg font-semibold mt-4 mb-2 text-white">8. Liability Waiver</h3>
          <p className="mb-2 text-slate-400">
            Parents waive all legal claims against Workzy related to:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-slate-400">
            <li>
              Personal injury, property damage, or misconduct involving their teen
              while using the platform
            </li>
            <li>Disputes between their teen and clients</li>
          </ul>

          <hr className="my-6 border-slate-700" />

          <h2 className="text-xl font-semibold mt-6 mb-2 text-white border-b border-slate-700 pb-2">
            SECTION III: CLIENTS (HIRING PARTIES)
          </h2>

          <h3 className="text-lg font-semibold mt-4 mb-2 text-white">
            9. Service Expectations
          </h3>
          <p className="mb-2 text-slate-400">Clients understand:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-slate-400">
            <li>Workzy does not guarantee job performance or skill level</li>
            <li>Teens may have limited experience and require guidance</li>
            <li>
              Clients must provide a safe, legal, and age-appropriate environment
            </li>
          </ul>

          <h3 className="text-lg font-semibold mt-4 mb-2 text-white">
            10. Assumption of Risk
          </h3>
          <p className="mb-2 text-slate-400">Clients agree that:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-slate-400">
            <li>
              Workzy is not liable for damages, losses, or injuries resulting from
              any work done
            </li>
            <li>All engagements are at the client’s own risk</li>
          </ul>

          <h3 className="text-lg font-semibold mt-4 mb-2 text-white">
            11. No Employment Relationship
          </h3>
          <p className="mb-2 text-slate-400">Clients agree not to:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-slate-400">
            <li>Misclassify a teen as an employee</li>
            <li>Require services that violate local child labor laws</li>
            <li>Demand transportation, extended hours, or dangerous tasks</li>
          </ul>

          <hr className="my-6 border-slate-700" />

          <h2 className="text-xl font-semibold mt-6 mb-2 text-white border-b border-slate-700 pb-2">
            SECTION IV: GENERAL PROVISIONS
          </h2>

          <h3 className="text-lg font-semibold mt-4 mb-2 text-white">
            12. Dispute Resolution
          </h3>
          <p className="text-slate-400 mb-4">
            Any dispute shall first be attempted through mediation. If unresolved,
            binding arbitration will be used in the state of [Insert State],
            waiving any right to trial.
          </p>

          <h3 className="text-lg font-semibold mt-4 mb-2 text-white">
            13. Hold Harmless Agreement
          </h3>
          <p className="mb-2 text-slate-400">
            By using the platform, all parties agree to hold Workzy, its owners,
            partners, and affiliates harmless from:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-slate-400">
            <li>Claims of negligence, liability, injury, or damages</li>
            <li>
              Legal costs, settlements, or judgments resulting from use of the
              platform
            </li>
          </ul>

          <h3 className="text-lg font-semibold mt-4 mb-2 text-white">
            14. Insurance Disclaimer
          </h3>
          <p className="text-slate-400 mb-4">
            Workzy does not provide insurance of any kind (liability, property, or
            accident). All parties must rely on their own policies and
            protections.
          </p>

          <h3 className="text-lg font-semibold mt-4 mb-2 text-white">15. Indemnification</h3>
          <p className="mb-2 text-slate-400">
            Users agree to indemnify Workzy against any claims arising from:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-slate-400">
            <li>Breach of these terms</li>
            <li>Actions of teens, parents, or clients</li>
            <li>Any illegal or unethical behavior while using the platform</li>
          </ul>

          <h3 className="text-lg font-semibold mt-4 mb-2 text-white">
            16. Modification of Terms
          </h3>
          <p className="text-slate-400">
            We may update these Terms at any time. Continued use after changes
            constitutes acceptance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
