# Generated by Django 3.2.8 on 2021-11-12 13:06

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Client',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('client', models.CharField(max_length=16, unique=True)),
                ('client_data', models.CharField(max_length=155, unique=True)),
                ('client_name', models.CharField(default='NotSet', max_length=155, null=True, unique=True)),
            ],
        ),
        migrations.CreateModel(
            name='ClientUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_name', models.CharField(max_length=55)),
                ('user_data', models.CharField(max_length=155, unique=True)),
                ('client', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='CORE.client')),
            ],
        ),
    ]