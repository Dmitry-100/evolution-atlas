# Smart Web Security и ARL

Конфигурация создаёт API-mode SWS-профиль, включает DENY-логи в Cloud Logging и задаёт четыре квоты для публичных AI-endpoint. Значения лимитов являются частью Terraform-конфигурации.

```bash
cd infra/sws
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

Если профили уже созданы вручную, сначала импортируйте их, чтобы Terraform не пытался создать дубликаты:

```bash
terraform import yandex_sws_advanced_rate_limiter_profile.public_ai_api ARL_PROFILE_ID
terraform import yandex_sws_security_profile.public_ai_api SWS_PROFILE_ID
terraform plan
```

Output `security_profile_id` сохраните в GitHub Actions secret `YC_SWS_SECURITY_PROFILE_ID`. Менять квоты следует только здесь и применять через проверенный `terraform plan`.
