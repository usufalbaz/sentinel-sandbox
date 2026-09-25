"""In-memory store — swap for Redis/Postgres later."""
import threading
from typing import Dict, Optional
from core.models import ScanRecord


class _Store:
    def __init__(self):
        self._lock = threading.Lock()
        self._data: Dict[str, ScanRecord] = {}

    def put(self, record: ScanRecord) -> None:
        with self._lock:
            self._data[record.scan_id] = record

    def get(self, scan_id: str) -> Optional[ScanRecord]:
        with self._lock:
            return self._data.get(scan_id)


store = _Store()
