from apps.volunteering.models import VolunteerProfile
from apps.pedagogy.models import SupportRequest

def calculate_match_suggestions(support_request_id):
    """
    Calcule des suggestions de matching pertinentes pour une demande de soutien F06 :
    - Correspondance des matières (+40 pts)
    - Niveau scolaire couvert (+25 pts)
    - Proximité géographique ou affinité d'île (+20 pts)
    - Disponibilité du profil (+15 pts)
    """
    try:
        req = SupportRequest.objects.get(id=support_request_id)
    except SupportRequest.DoesNotExist:
        return []

    req_subjects = set(req.subjects.values_list('id', flat=True))
    student = req.student
    student_island = student.island
    student_level = student.school_level

    # Bénévoles actifs et disponibles
    candidates = VolunteerProfile.objects.filter(
        verification_status=VolunteerProfile.VerificationStatus.VERIFIED,
        is_available_for_new_student=True
    ).select_related('user').prefetch_related('subjects')

    suggestions = []
    for vol in candidates:
        score = 0
        reasons = []

        # 1. Matières
        vol_subjects = set(vol.subjects.values_list('id', flat=True))
        common_subjects = req_subjects.intersection(vol_subjects)
        if common_subjects:
            score += 40
            reasons.append(f"{len(common_subjects)} matière(s) en commun")
        else:
            # Sans matière commune, le matching est trop faible
            continue

        # 2. Niveau scolaire
        if vol.levels_can_teach in ['TOUS', student_level]:
            score += 25
            reasons.append("Niveau scolaire adapté")
        else:
            score += 5

        # 3. Localisation / Île
        if vol.user.island == student_island:
            score += 20
            reasons.append(f"Même localisation ({vol.user.get_island_display()})")
        elif req.format_preference == SupportRequest.Format.REMOTE or vol.user.island == 'FRANCE':
            score += 15
            reasons.append("Compatible accompagnement à distance")

        # 4. Disponibilité déclarée
        if vol.hours_per_week >= 2:
            score += 15
            reasons.append(f"{vol.hours_per_week}h/semaine disponibles")

        suggestions.append({
            'volunteer_id': vol.user.id,
            'volunteer_name': vol.user.get_full_name() or vol.user.username,
            'volunteer_email': vol.user.email,
            'island': vol.user.get_island_display(),
            'score': min(score, 100),
            'reasons': reasons,
            'availabilities': vol.availabilities,
            'languages': vol.languages,
            'experience': vol.experience
        })

    # Trier par score décroissant
    suggestions.sort(key=lambda x: x['score'], reverse=True)
    return suggestions
