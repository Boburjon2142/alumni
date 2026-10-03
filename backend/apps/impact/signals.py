from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from common.cache_utils import invalidate_cache_prefix
from .models import Contribution, ScoreTransaction, AlumniAchievement


@receiver([post_save, post_delete], sender=Contribution)
@receiver([post_save, post_delete], sender=ScoreTransaction)
@receiver([post_save, post_delete], sender=AlumniAchievement)
def clear_impact_cache(sender, **kwargs):
    invalidate_cache_prefix("api:impact")
