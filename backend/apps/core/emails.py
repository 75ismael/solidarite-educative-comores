import logging
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger('notifications')

def _safe_send_mail(subject, message, recipient_list, from_email=None):
    """
    Envoi d'e-mail sécurisé qui n'interrompt jamais l'application en cas d'erreur réseau.
    """
    if not recipient_list:
        return 0

    valid_recipients = [r for r in recipient_list if r and '@' in r]
    if not valid_recipients:
        return 0

    sender = from_email or getattr(settings, 'DEFAULT_FROM_EMAIL', 'contact@benevolat.km')

    try:
        sent = send_mail(
            subject=subject,
            message=message,
            from_email=sender,
            recipient_list=valid_recipients,
            fail_silently=False
        )
        logger.info(f"Notification e-mail envoyée à {valid_recipients} : '{subject}'")
        return sent
    except Exception as exc:
        logger.error(f"Erreur d'envoi d'e-mail à {valid_recipients} : {exc}")
        return 0


def send_liaison_note_notification(note):
    """
    Notifie le bénévole et/ou la famille lors d'un nouveau mot dans le Carnet de Liaison (F11).
    """
    pairing = note.pairing
    author = note.author
    author_name = author.get_full_name() or author.username
    author_role = getattr(author, 'get_role_display', lambda: author.role)()

    # Destinataires : tous les membres du binôme sauf l'auteur du message
    recipients = set()
    if pairing.volunteer and pairing.volunteer.email and pairing.volunteer.email != author.email:
        recipients.add(pairing.volunteer.email)

    if pairing.student and pairing.student.parent and pairing.student.parent.email and pairing.student.parent.email != author.email:
        recipients.add(pairing.student.parent.email)

    if pairing.coordinator and pairing.coordinator.email and pairing.coordinator.email != author.email:
        recipients.add(pairing.coordinator.email)

    if not recipients:
        return 0

    student_code = pairing.student.anonymous_code if pairing.student else "Élève"
    subject = f"[Solidarité Éducative] Nouveau mot de {author_name} dans le carnet de liaison ({student_code})"

    message = f"""Bonjour,

Un nouveau message vient d'être posté dans le carnet de liaison du binôme {student_code} ({pairing.subject.name}).

Auteur : {author_name} ({author_role})
Date : {note.created_at.strftime('%d/%m/%Y à %H:%M')}

--- Message ---
{note.message}
----------------

Vous pouvez consulter l'historique complet et répondre en vous connectant à votre espace sécurisé :
https://solidarite-educative-comores.org/dashboard

Cordialement,
L'équipe Solidarité Éducative Comores
---
Protection des mineurs : Ne partagez jamais vos coordonnées personnelles directes.
"""
    return _safe_send_mail(subject, message, list(recipients))


def send_pairing_welcome_notification(pairing):
    """
    Notifie le bénévole et le parent lors de la constitution d'un nouveau binôme (F06).
    """
    recipients = []
    if pairing.volunteer and pairing.volunteer.email:
        recipients.append(pairing.volunteer.email)
    if pairing.student and pairing.student.parent and pairing.student.parent.email:
        recipients.append(pairing.student.parent.email)

    if not recipients:
        return 0

    student_code = pairing.student.anonymous_code
    grade = pairing.student.grade
    subject_name = pairing.subject.name
    volunteer_name = pairing.volunteer.get_full_name() or pairing.volunteer.username

    subject = f"[Solidarité Éducative] Nouveau binôme constitué pour l'élève {student_code}"

    message = f"""Bonjour,

Nous avons le plaisir de vous informer qu'un binôme d'accompagnement scolaire a été validé par la coordination pédagogique.

Détails de l'accompagnement :
- Élève : {student_code} (Classe : {grade})
- Tuteur bénévole : {volunteer_name}
- Matière principale : {subject_name}
- Rythme convenu : {pairing.weekly_frequency}

Le carnet de liaison sécurisé est désormais ouvert. Vous pouvez dès à présent échanger vos premières consignes et convenir des horaires de séances :
https://solidarite-educative-comores.org/dashboard

Rappel déontologique :
Conformément à notre charte officielle de protection des mineurs, les échanges s'effectuent via la plateforme ou des canaux supervisés.

Merci pour votre confiance et votre engagement solidaire.

Bien chaleureusement,
La Coordination Pédagogique
Solidarité Éducative Comores
"""
    return _safe_send_mail(subject, message, recipients)


def send_session_scheduled_notification(session):
    """
    Rappel de séance planifiée ou modifiée (F07).
    """
    recipients = []
    pairing = session.pairing
    if pairing.volunteer and pairing.volunteer.email:
        recipients.append(pairing.volunteer.email)
    if pairing.student and pairing.student.parent and pairing.student.parent.email:
        recipients.append(pairing.student.parent.email)

    if not recipients:
        return 0

    student_code = pairing.student.anonymous_code if pairing.student else "Élève"
    date_str = session.scheduled_start.strftime('%d/%m/%Y à %H:%M')
    subject = f"[Solidarité Éducative] Séance de soutien planifiée le {date_str} ({session.subject.name})"

    session_format = session.get_format_display() if hasattr(session, 'get_format_display') else session.format
    objectives = session.objectives or "Révisions et exercices d'application"

    message = f"""Bonjour,

Une séance d'accompagnement scolaire a été programmée pour l'élève {student_code}.

Détails du cours :
- Matière : {session.subject.name}
- Date et heure : {date_str}
- Format : {session_format}
- Objectif de la séance : {objectives}

En cas d'empêchement ou d'imprévu (coupure réseau, électricité), merci de prévenir sans attendre via le carnet de liaison :
https://solidarite-educative-comores.org/dashboard

Bonne séance de travail !

L'équipe Solidarité Éducative Comores
"""
    return _safe_send_mail(subject, message, recipients)


def send_volunteer_verified_notification(volunteer_profile):
    """
    Félicitations et activation du profil bénévole (F05).
    """
    user = volunteer_profile.user
    if not user.email:
        return 0

    subject = "[Solidarité Éducative] Votre candidature bénévole a été validée !"

    message = f"""Bonjour {user.first_name or user.username},

Félicitations ! Votre profil de bénévole accompagnateur a été vérifié et validé par notre équipe de coordination.

Votre engagement compte énormément pour les élèves aux Comores.
Vous êtes désormais éligible pour être mis en relation avec des collégiens ou lycéens selon vos matières de prédilection et vos disponibilités.

Prochaines étapes :
1. Dès qu'un besoin correspond à votre profil, vous recevrez une notification de binôme.
2. Vous pouvez également consulter les appels à candidatures ouverts sur : https://solidarite-educative-comores.org/missions

Nous vous remercions chaleureusement pour votre générosité et votre solidarité.

Bienvenue dans l'équipe !
La Coordination des Bénévoles
Solidarité Éducative Comores
"""
    return _safe_send_mail(subject, message, [user.email])


def send_safeguarding_alert_notification(report):
    """
    Alerte confidentielle prioritaire à l'Officier de Protection des Mineurs (F15).
    """
    officer_email = getattr(settings, 'SAFEGUARDING_OFFICER_EMAIL', 'protection@benevolat.km')
    subject = f"🚨 [CONFIDENTIEL] Signalement de protection des mineurs {report.report_number}"

    message = f"""ALERTE DE PROTECTION DES MINEURS

Un nouveau signalement sensible vient d'être déposé sur le canal confidentiel sécurisé.

- Numéro de dossier : {report.report_number}
- Niveau d'urgence : {report.urgency if hasattr(report, 'urgency') else 'ÉLEVÉ'}
- Date de transmission : {report.created_at.strftime('%d/%m/%Y à %H:%M')}
- Type de fait : {report.category if hasattr(report, 'category') else 'Signalement de sauvegarde'}

Pour accéder au dossier étanche et activer le protocole de prise en charge immédiat :
https://solidarite-educative-comores.org/dashboard

Ce message est strictement confidentiel.
Cellule de Protection des Mineurs
"""
    return _safe_send_mail(subject, message, [officer_email])
