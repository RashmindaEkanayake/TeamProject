"""Cross-platform backend launcher; loads local .env without executing its contents."""
import os
from pathlib import Path
import shutil
import subprocess
root=Path(__file__).resolve().parent.parent
config=root/'.env'
if not config.exists():raise SystemExit('Run python scripts/configure.py first, or supply environment variables manually using Maven.')
env=os.environ.copy()
for line in config.read_text().splitlines():
 line=line.strip()
 if not line or line.startswith('#'):continue
 key,sep,value=line.partition('=')
 if not sep:raise SystemExit('Invalid line in .env')
 env[key.strip()]=value.strip().strip('"').strip("'")
maven=shutil.which('mvn') or shutil.which('mvn.cmd')
if not maven:raise SystemExit('Install Maven 3.9+ and add mvn to PATH.')
raise SystemExit(subprocess.call([maven,'spring-boot:run'],cwd=root/'backend',env=env))
