"""Generate private local configuration. Never overwrite existing secrets."""
from pathlib import Path
import secrets
import os
root=Path(__file__).resolve().parent.parent
path=root/'.env'
if path.exists():
    raise SystemExit('.env already exists; edit it manually instead of replacing stored credentials.')
values={
 'DB_URL':'jdbc:mysql://127.0.0.1:3306/atlas_erp?serverTimezone=UTC&allowPublicKeyRetrieval=true&useSSL=false',
 'DB_USERNAME':'atlas_app', 'DB_PASSWORD':secrets.token_urlsafe(24),
 'MYSQL_ROOT_PASSWORD':secrets.token_urlsafe(32), 'JWT_SECRET':secrets.token_urlsafe(48),
 'CORS_ALLOWED_ORIGINS':'http://localhost:5173,http://127.0.0.1:5173',
 'BOOTSTRAP_ENABLED':'true', 'BOOTSTRAP_ADMIN_PASSWORD':secrets.token_urlsafe(18),
 'BOOTSTRAP_SALES_PASSWORD':secrets.token_urlsafe(18),
}
path.write_text('\n'.join(f'{key}={value}' for key,value in values.items())+'\n')
try:os.chmod(path,0o600)
except OSError:pass
print('Created .env. Open it privately to obtain the initial admin and salesrep passwords.')
print('After first startup, set BOOTSTRAP_ENABLED=false. Do not submit or commit .env.')
