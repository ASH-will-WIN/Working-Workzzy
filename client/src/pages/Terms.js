import React from "react";
import { useNavigate } from "react-router-dom";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Removed back button as requested */}

      <h1 className="text-3xl font-bold mb-8 text-gray-900">
        Terms and Conditions
      </h1>

      <div className="prose prose-lg max-w-none">
        <h2 className="text-xl font-semibold mt-6 mb-2 border-b pb-2">
          1. Acceptance of Terms
        </h2>
        <p>
          By accessing or using Workzy (“we,” “our,” the platform”), you agree
          to be bound by these Terms and Conditions. If you do not agree, you
          may not use the platform.
        </p>

        <hr className="my-6 border-gray-300" />

        <h2 className="text-xl font-semibold mt-6 mb-2 border-b pb-2">
          2. Platform Overview
        </h2>
        <p>
          Workzy connects clients with local teen service providers aged 13–17
          for tasks such as car detailing, lawn care, babysitting, and other
          non-specialized work. We are a facilitator, not an employer or
          contractor.
        </p>

        <hr className="my-6 border-gray-300" />

        <h2 className="text-xl font-semibold mt-6 mb-2 border-b pb-2">
          SECTION I: TEEN WORKERS
        </h2>

        <h3 className="text-lg font-semibold mt-4 mb-1">3. Eligibility</h3>
        <ul className="list-disc pl-6 mb-4">
          <li>
            Teen workers must be between 13–17 years old and have parental or
            legal guardian consent to register and accept jobs.
          </li>
          <li>
            Teens under the age of 18 may not accept jobs that exceed the scope
            of safe, supervised, or age-appropriate labor (no power tools,
            driving, hazardous chemicals, etc.).
          </li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-1">
          4. Independent Engagement
        </h3>
        <ul className="list-disc pl-6 mb-4">
          <li>
            Teens are not employees of Workzy. They operate as independent
            agents.
          </li>
          <li>
            Workzy does not direct, supervise, or control how tasks are
            performed.
          </li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-1">5. Responsibility</h3>
        <ul className="list-disc pl-6 mb-4">
          <li>
            Teen workers and their parents assume full responsibility for:
            <ul className="list-circle pl-6 mt-2">
              <li>Timeliness and completion of tasks</li>
              <li>Quality of work performed</li>
              <li>Compliance with any applicable local labor laws</li>
              <li>Taxes (if required)</li>
            </ul>
          </li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-1">6. Code of Conduct</h3>
        <p className="mb-2">Teen workers agree to:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Be respectful and professional</li>
          <li>Never enter a client’s home without explicit permission</li>
          <li>Refuse unsafe or illegal tasks</li>
        </ul>
        <p className="mt-2">
          Violation of this policy may result in account suspension or
          termination.
        </p>

        <hr className="my-6 border-gray-300" />

        <h2 className="text-xl font-semibold mt-6 mb-2 border-b pb-2">
          SECTION II: PARENTS / LEGAL GUARDIANS
        </h2>

        <h3 className="text-lg font-semibold mt-4 mb-1">
          7. Consent & Oversight
        </h3>
        <p className="mb-2">By approving a teen’s registration, you:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Grant permission for them to accept and perform jobs</li>
          <li>
            Assume full liability for their conduct, injuries, or damages caused
          </li>
          <li>
            Agree to monitor their activity and ensure they perform only safe,
            appropriate tasks
          </li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-1">8. Liability Waiver</h3>
        <p className="mb-2">
          Parents waive all legal claims against Workzy related to:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>
            Personal injury, property damage, or misconduct involving their teen
            while using the platform
          </li>
          <li>Disputes between their teen and clients</li>
        </ul>

        <hr className="my-6 border-gray-300" />

        <h2 className="text-xl font-semibold mt-6 mb-2 border-b pb-2">
          SECTION III: CLIENTS (HIRING PARTIES)
        </h2>

        <h3 className="text-lg font-semibold mt-4 mb-1">
          9. Service Expectations
        </h3>
        <p className="mb-2">Clients understand:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Workzy does not guarantee job performance or skill level</li>
          <li>Teens may have limited experience and require guidance</li>
          <li>
            Clients must provide a safe, legal, and age-appropriate environment
          </li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-1">
          10. Assumption of Risk
        </h3>
        <p className="mb-2">Clients agree that:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>
            Workzy is not liable for damages, losses, or injuries resulting from
            any work done
          </li>
          <li>All engagements are at the client’s own risk</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-1">
          11. No Employment Relationship
        </h3>
        <p className="mb-2">Clients agree not to:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Misclassify a teen as an employee</li>
          <li>Require services that violate local child labor laws</li>
          <li>Demand transportation, extended hours, or dangerous tasks</li>
        </ul>

        <hr className="my-6 border-gray-300" />

        <h2 className="text-xl font-semibold mt-6 mb-2 border-b pb-2">
          SECTION IV: GENERAL PROVISIONS
        </h2>

        <h3 className="text-lg font-semibold mt-4 mb-1">
          12. Dispute Resolution
        </h3>
        <p>
          Any dispute shall first be attempted through mediation. If unresolved,
          binding arbitration will be used in the state of [Insert State],
          waiving any right to trial.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-1">
          13. Hold Harmless Agreement
        </h3>
        <p className="mb-2">
          By using the platform, all parties agree to hold Workzy, its owners,
          partners, and affiliates harmless from:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Claims of negligence, liability, injury, or damages</li>
          <li>
            Legal costs, settlements, or judgments resulting from use of the
            platform
          </li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-1">
          14. Insurance Disclaimer
        </h3>
        <p>
          Workzy does not provide insurance of any kind (liability, property, or
          accident). All parties must rely on their own policies and
          protections.
        </p>

        <h3 className="text-lg font-semibold mt-4 mb-1">15. Indemnification</h3>
        <p className="mb-2">
          Users agree to indemnify Workzy against any claims arising from:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Breach of these terms</li>
          <li>Actions of teens, parents, or clients</li>
          <li>Any illegal or unethical behavior while using the platform</li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-1">
          16. Modification of Terms
        </h3>
        <p>
          We may update these Terms at any time. Continued use after changes
          constitutes acceptance.
        </p>
      </div>
    </div>
  );
};

export default Terms;
