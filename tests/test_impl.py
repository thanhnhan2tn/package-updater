from src.impl import update_package

def test_update_package():
    result = update_package("test-package")
    assert "Updating test-package" in result
