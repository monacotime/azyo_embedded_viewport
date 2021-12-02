# Generated by Django 3.2.8 on 2021-11-16 12:25

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('CORE', '0002_auto_20211113_1717'),
    ]

    operations = [
        migrations.CreateModel(
            name='ClientUserResults',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('selfie_encodings', models.BinaryField(max_length=3000)),
                ('document_profile_pic_encodings', models.BinaryField(max_length=3000)),
                ('kyc_number', models.CharField(max_length=3000)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='CORE.clientuser')),
            ],
        ),
    ]
