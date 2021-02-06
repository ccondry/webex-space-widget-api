#!/bin/sh
echo "running yarn"
yarn
if [ $? -eq 0 ]; then
  echo "edit .env file first"
  vim .env
  echo "installing systemd service..."
  sudo cp systemd.service /lib/systemd/system/webex-space-widget-api.service
  echo "enabling systemd service..."
  sudo systemctl enable webex-space-widget-api.service
  echo "starting systemd service..."
  systemctl start webex-space-widget-api.service
  echo "install webex-space-widget-api.service is complete."
else
  echo "yarn failed"
fi
