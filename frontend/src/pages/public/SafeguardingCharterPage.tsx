import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, AlertTriangle, CheckCircle2, ShieldAlert, BookOpen } from 'lucide-react';

export const SafeguardingCharterPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* 1. Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-brand-blue text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-brand-teal" /> Document de référence officiel
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-blue">
          Charte de Protection des Mineurs & Déontologie
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl mx-auto leading-relaxed">
          Adoptée par l'association et obligatoire pour l'ensemble des bénévoles, coordinateurs et intervenants auprès d'élèves mineurs aux Comores et en France.
        </p>
      </div>

      {/* 2. Préambule */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-teal" />
          Préambule & Engagement de l'Association
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          L'accompagnement scolaire solidaire a pour vocation exclusive la réussite éducative, l'épanouissement intellectuel et la prise de confiance des élèves. La protection des mineurs contre toute forme d'abus, de négligence, de discrimination ou de harcèlement constitue la priorité absolue et non négociable de notre dispositif.
        </p>
      </div>

      {/* 3. Les 6 Articles de la Charte */}
      <div className="space-y-6">
        {/* Article 1 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-sm text-brand-blue">
            <span className="w-6 h-6 rounded-full bg-teal-50 text-brand-teal flex items-center justify-center text-xs">1</span>
            <h3>Consentement parental et transparence envers les familles</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Aucun accompagnement d'un élève mineur ne peut débuter sans l'accord préalable, éclairé et documenté de son parent ou représentant légal. Les familles sont systématiquement informées des jours, horaires et modalités des séances, et disposent d'un accès permanent aux comptes rendus rédigés par les bénévoles.
          </p>
        </div>

        {/* Article 2 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-sm text-brand-blue">
            <span className="w-6 h-6 rounded-full bg-teal-50 text-brand-teal flex items-center justify-center text-xs">2</span>
            <h3>Canaux d'échange encadrés et respect de la vie privée</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Les séances à distance doivent se dérouler exclusivement via les canaux convenus avec les parents (téléphone, WhatsApp sous supervision familiale). Il est formellement interdit d'utiliser des canaux de messagerie éphémères ou d'encourager des communications privées non éducatives.
          </p>
        </div>

        {/* Article 3 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-sm text-brand-blue">
            <span className="w-6 h-6 rounded-full bg-teal-50 text-brand-teal flex items-center justify-center text-xs">3</span>
            <h3>Interdiction absolue de rencontres isolées non déclarées</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Pour les séances en présentiel aux Comores, les rencontres doivent avoir lieu au domicile familial en présence d'un adulte, ou dans un lieu public autorisé (établissement scolaire partenaire, bibliothèque). Les rencontres individuelles dans un cadre isolé non validé par la coordination sont strictement interdites.
          </p>
        </div>

        {/* Article 4 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-sm text-brand-blue">
            <span className="w-6 h-6 rounded-full bg-teal-50 text-brand-teal flex items-center justify-center text-xs">4</span>
            <h3>Attitude bienveillante et posture pédagogique digne</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Le bénévole adopte en toute circonstance une posture patiente, encourageante et respectueuse. Tout propos dégradant, humiliant, sexiste, discriminatoire ou violent entraîne la suspension immédiate du binôme et l'exclusion définitive de la plateforme.
          </p>
        </div>

        {/* Article 5 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-sm text-brand-blue">
            <span className="w-6 h-6 rounded-full bg-teal-50 text-brand-teal flex items-center justify-center text-xs">5</span>
            <h3>Anonymisation stricte et protection des données</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Les données d'identité des mineurs sont masquées au public par un code anonymisé (ex: ELV-XXXX). Aucune photo, nom de famille complet ou coordonnée de mineur ne peut être publiée sur les réseaux sociaux ou transmise à des tiers sans autorisation écrite préalable.
          </p>
        </div>

        {/* Article 6 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-sm text-brand-blue">
            <span className="w-6 h-6 rounded-full bg-teal-50 text-brand-teal flex items-center justify-center text-xs">6</span>
            <h3>Devoir d'alerte et canal confidentiel de signalement</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Toute personne (bénévole, parent, élève, coordinateur) témoin ou informée d'une situation inquiétante concernant la sécurité, la santé ou le bien-être d'un élève a l'obligation morale et déontologique d'en informer immédiatement le Référent Protection via le canal confidentiel dédié.
          </p>
        </div>
      </div>

      {/* 4. Encadré d'action pour signalement */}
      <div className="rounded-3xl bg-rose-50 border border-rose-200 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 text-rose-800">
          <ShieldAlert className="w-7 h-7 text-rose-600 shrink-0" />
          <div>
            <h3 className="font-bold text-base sm:text-lg">Besoin de signaler une situation inquiétante ?</h3>
            <p className="text-xs text-rose-700">Le canal confidentiel est accessible 24h/24 et traité directement par notre référente protection.</p>
          </div>
        </div>
        <div>
          <Link
            to="/signalement-protection"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow transition-colors"
          >
            Accéder au formulaire de signalement sécurisé
          </Link>
        </div>
      </div>
    </div>
  );
};
