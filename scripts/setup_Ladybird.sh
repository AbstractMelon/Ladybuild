#!/bin/bash

set -e  # Exit immediately if a command exits with a non-zero status

LOG_FILE="/var/log/ladybuild_install.log"
echo "Starting Ladybuild installation..." | tee -a $LOG_FILE

# Clone the Ladybird repository
echo "Cloning Ladybird repository..." | tee -a $LOG_FILE
git clone https://github.com/LadybirdBrowser/ladybird.git | tee -a $LOG_FILE
cd ladybird || { echo "Failed to enter ladybird directory." | tee -a $LOG_FILE; exit 1; }

# Ensure Clang 17 or newer is installed
echo "Checking for Clang 17 or newer..." | tee -a $LOG_FILE
if ! clang --version | grep -q "version 1[7-9]"; then
    echo "Clang 17 or newer is required. Please install it manually." | tee -a $LOG_FILE
    exit 1
fi

# Ensure CMake 3.25 or newer is installed
echo "Checking for CMake 3.25 or newer..." | tee -a $LOG_FILE
if ! cmake --version | grep -qE "version 3\.(2[5-9]|[3-9][0-9])"; then
    echo "CMake 3.25 or newer is required. Please install it manually." | tee -a $LOG_FILE
    exit 1
fi

# Run Ladybird setup script
echo "Running Ladybird setup script..." | tee -a $LOG_FILE
./Meta/ladybird.sh run ladybird | tee -a $LOG_FILE

# Navigate to the build directory
cd Build/release || { echo "Failed to enter build directory." | tee -a $LOG_FILE; exit 1; }

# Delete unwanted files
echo "Cleaning up build directory..." | tee -a $LOG_FILE
rm -f *.log CMakeCache.txt cmake_install.cmake build.ninja | tee -a $LOG_FILE
rm -rf .qt Testing CMakeFiles vcpkg_installed | tee -a $LOG_FILE

# Create additional files
echo "Creating run.sh script..." | tee -a $LOG_FILE
echo "#!/bin/bash

LOG_FILE=\"/var/log/ladybuild_install.log\"

echo \"Updating and upgrading system packages...\" | tee -a $LOG_FILE
sudo apt update && sudo apt upgrade -y | tee -a $LOG_FILE

if [ \"\$(lsb_release -is)\" == \"Ubuntu\" ]; then
  echo \"Installing common libraries...\" | tee -a $LOG_FILE
  sudo apt install -y \\
    libqt6core6a libqt6network6 libqt6widgets6 libqt6gui6 libssl3 libcrypto3 \\
    libgl1-mesa-glx libvulkan1 libsqlite3-0 libfreetype6 libfontconfig1 libexpat1 \\
    libglib2.0-0 libharfbuzz0b libpng16-16 libx11-6 libxkbcommon0 libbrotli1 \\
    libcurl4 libsystemd0 libdbus-1-3 libbz2-1.0 libpcre2-16-0 \\
    libavformat-dev libavcodec-dev libavutil-dev libpulse0 libyuv-dev \\
    libdav1d-dev libjxl-dev libhwy-dev libbrotli-dev libcurl4-openssl-dev \\
    libgio-2.0-0 libduktape-dev | tee -a $LOG_FILE
  echo \"All dependencies installed.\" | tee -a $LOG_FILE
else
  echo \"Not an Ubuntu system. Skipping library installation.\" | tee -a $LOG_FILE
fi

cd \"\$(dirname \"$0\")/bin\" || { echo \"Failed to change directory.\" | tee -a $LOG_FILE; exit 1; }

echo \"Running Ladybird...\" | tee -a $LOG_FILE
./Ladybird | tee -a $LOG_FILE" > run.sh
chmod +x run.sh

echo "Creating readme.md..." | tee -a $LOG_FILE
echo "# Ladybuild

Thank you for choosing to install Ladybird using Ladybuild! Ladybird is a truly independent web browser project that is still in its early stages of development. As such, you may encounter bugs or unexpected behavior. We appreciate your patience and feedback during this time.

## Getting Started

1. **Installation**: Make sure that you have all necessary dependencies and tools installed on your system. Refer to our [installation guide](https://github.com/abstractmelon/ladybuild/wiki/installation-guide) for detailed instructions.

2. **Running Ladybird**:

   - Execute the \`run.sh\` script to start Ladybird.
   - Open a terminal and navigate to the directory where \`run.sh\` is located.
   - Run the command: \`./run.sh\`

3. **Feedback and Support**:
   - If you encounter any issues or have suggestions, please report them on our [GitHub Issues page](https://github.com/abstractmelon/ladybuild/issues).

Thank you for being a part of the Ladybird community!
" > readme.md

# Archive the current directory
echo "Creating archive of build directory..." | tee -a $LOG_FILE
cd ..
tar -czf ladybird_build.tar.gz release | tee -a $LOG_FILE

cd release

echo "Process complete. The build directory has been archived as ladybird_build.tar.gz." | tee -a $LOG_FILE
