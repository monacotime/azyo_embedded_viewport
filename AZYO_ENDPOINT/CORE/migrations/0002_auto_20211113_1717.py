# Generated by Django 3.2.8 on 2021-11-13 11:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('CORE', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='clientuser',
            name='result_status',
            field=models.CharField(choices=[('INITIALIZED', 'INITIALIZED'), ('SELFIE', 'SELFIE'), ('FRONTSIDE', 'FRONTSIDE'), ('BACKSIDE', 'BACKSIDE'), ('RESULT', 'RESULT'), ('FINISHED', 'FINISHED')], default='INITIALIZED', max_length=30),
        ),
        migrations.AlterField(
            model_name='client',
            name='client_name',
            field=models.CharField(default='client default name', max_length=155, unique=True),
            preserve_default=False,
        ),
    ]