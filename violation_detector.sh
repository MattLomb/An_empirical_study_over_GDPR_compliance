#!/bin/bash

echo "Welcome to the Violation Detector tool!"

print_usage() {
    echo "Usage: $0 <URL> [consents_value]"
    shift
    echo "<URL> = URL on which perform the violation detection"
    shift
    echo "[no_interaction] = perform the detection of violations with no interaction with the CMP banner -> this can be used to perform the detection of COOKIES SETTED AT STARTUP"
    shift
    echo "[0] = Use 0 if you want to give consent for NECESSARY cookies"
    shift
    echo "[1] = Use 1 if you want to give consent for FUNCTIONAL cookies"
    shift
    echo "[2] = Use 2 if you want to give consent for ANALYTICS cookies"
    shift
    echo "[3] = Use 3 if you want to give consent for ADVERTISING cookies"
    shift
    echo "EXAMPLE: ./violation_detector.sh hdblog.it 0 1 2"
}

# Check if all parameters have been passed (URL is mandatory)
if [ $# -eq 0 ]; then
  print_usage
  exit 1
fi

# Check if -help has been passed
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
  print_usage
  exit 0
fi

# Save URL in var
url="$1"

# Assign value to params
if [ "$2" = "no_interaction" ]; then
  consent0="no_interaction"
else
  consent0="${2:- -1}"
fi

consent1="${3:- -1}"
consent2="${4:- -1}"
consent3="${5:- -1}"

echo "START DETECTION ON $url"
echo $consent0
echo $consent1
echo $consent2
echo $consent3

node cookies_downloader.js "$url" "$consent0" "$consent1" "$consent2" "$consent3"

exit 0