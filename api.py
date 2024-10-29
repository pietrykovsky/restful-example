from dataclasses import dataclass, asdict
from typing import Any
import json
from http import HTTPStatus
from flask import Flask, request, jsonify
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

ITEMS_FILE = "items.json"


@dataclass
class Item:
    """Data class representing an item in the system."""
    id: int
    name: str
    description: str

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "Item":
        """Create an Item instance from a dictionary."""
        return cls(id=data.get("id", 0), name=data.get("name", ""), description=data.get("description", ""))


def load_items() -> list[Item]:
    """Load items from the JSON file."""
    try:
        with open(ITEMS_FILE, "r", encoding="utf-8") as f:
            items_data = json.load(f)
            return [Item.from_dict(item) for item in items_data]
    except FileNotFoundError:
        return []


def save_items(items: list[Item]) -> None:
    """Save items to the JSON file."""
    with open(ITEMS_FILE, "w", encoding="utf-8") as f:
        json.dump([asdict(item) for item in items], f, indent=2)


@app.route("/api/items", methods=["POST"])
def create_item() -> tuple[dict[str, Any], int]:
    """Create a new item."""
    items = load_items()
    item_data = request.json or {}

    id = max(item.id for item in items) + 1 if items else 1
    new_item = Item(id=id, name=item_data.get("name", ""), description=item_data.get("description", ""))

    items.append(new_item)
    save_items(items)

    return asdict(new_item), HTTPStatus.CREATED


@app.route("/api/items", methods=["GET"])
def get_items() -> list[dict[str, Any]]:
    """Retrieve all items."""
    items = load_items()
    return jsonify([asdict(item) for item in items])


@app.route("/api/items/<int:item_id>", methods=["GET"])
def get_item(item_id: int) -> tuple[dict[str, Any], int]:
    """Retrieve a single item by ID."""
    items = load_items()
    item = next((item for item in items if item.id == item_id), None)

    if item is None:
        return ({"error": "Item not found"}, HTTPStatus.NOT_FOUND)

    return asdict(item), HTTPStatus.OK


@app.route("/api/items/<int:item_id>", methods=["PUT"])
def update_item(item_id: int) -> tuple[dict[str, Any], int]:
    """Update an existing item."""
    items = load_items()
    item_index = next((index for index, item in enumerate(items) if item.id == item_id), None)

    if item_index is None:
        return ({"error": "Item not found"}, HTTPStatus.NOT_FOUND)

    item_data = request.json or {}
    updated_item = Item(id=item_id, name=item_data.get("name", ""), description=item_data.get("description", ""))

    items[item_index] = updated_item
    save_items(items)

    return asdict(updated_item), HTTPStatus.OK


@app.route("/api/items/<int:item_id>", methods=["DELETE"])
def delete_item(item_id: int) -> tuple[str, int]:
    """Delete an item by ID."""
    items = load_items()
    updated_items = [item for item in items if item.id != item_id]

    if len(updated_items) == len(items):
        return "", HTTPStatus.NO_CONTENT

    save_items(updated_items)
    return "", HTTPStatus.NO_CONTENT


if __name__ == "__main__":
    app.run(debug=True, port=8000)
