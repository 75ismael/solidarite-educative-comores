import React, { useState, useEffect } from 'react';
import { apiClient, extractResults } from '../api/client';
import { Pairing, LiaisonNote } from '../types';
import { MessageSquare, Send, User, Clock, ShieldCheck, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pairing: Pairing;
}

export const LiaisonNotebookModal: React.FC<Props> = ({ isOpen, onClose, pairing }) => {
  const [notes, setNotes] = useState<LiaisonNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<LiaisonNote[]>(`/matching/pairings/${pairing.id}/notes/`);
      setNotes(extractResults<LiaisonNote>(res.data));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotes();
    }
  }, [isOpen, pairing.id]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const res = await apiClient.post<LiaisonNote>(`/matching/pairings/${pairing.id}/notes/`, {
        message: newMessage.trim(),
      });
      setNotes((prev) => [...prev, res.data]);
      setNewMessage('');
    } catch (err) {
      alert("Erreur lors de l'envoi de la note dans le carnet de liaison.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-teal-100 text-teal-800">
                <MessageSquare className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
                  Carnet de liaison encadré (F11)
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Binôme : {pairing.student_details?.first_name} ({pairing.student_details?.anonymous_code}) & {pairing.volunteer_details?.first_name}
                </h3>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Matière : <strong>{pairing.subject_details?.name}</strong> • Échanges visibles par le bénévole, la famille et la coordination.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
          {loading ? (
            <div className="text-center py-12 text-xs text-slate-400">
              Chargement des échanges du carnet de liaison...
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <p className="text-sm font-semibold text-slate-600">
                Aucun message dans le carnet de liaison pour le moment.
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Partagez des encouragements, des consignes de travail ou signalez une information utile pour le prochain cours.
              </p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{note.author_name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {note.author_role}
                    </span>
                  </div>
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(note.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {note.message}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Safety Note & Input Form */}
        <div className="p-4 sm:p-6 border-t border-slate-100 bg-white space-y-3">
          <div className="flex items-center gap-1.5 text-[11px] text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-100">
            <ShieldCheck className="w-4 h-4 shrink-0 text-teal-700" />
            <span>
              Espace sécurisé conforme à la charte de protection des mineurs : aucun échange d'adresse personnelle ni de coordonnées directes.
            </span>
          </div>

          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Écrire un mot, un conseil ou un encouragement..."
              className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-teal"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-teal hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow disabled:opacity-50 transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>{sending ? 'Envoi...' : 'Envoyer'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
