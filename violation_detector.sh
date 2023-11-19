#!/bin/bash

echo "Welcome to the Violation Detector tool! \n The tool will perform the detection of the GDRP violation over the website given in input. \n At the end it will print a report using the detection model CookieBlock and then Cookiepedia."

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

# Save current directory
current_directory=$(pwd)

# Save URL in var
url="$1"

# Save JSON out path
json_out="cookies_formatted/"$url".json"

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
#echo $consent0
#echo $consent1
#echo $consent2
#echo $consent3

node cookies_downloader.js "$url" "$consent0" "$consent1" "$consent2" "$consent3"

echo "COOKIES DOWNLOAD COMPLETED: saved in "$json_out

# Variables for CookieBlock execution
cookie_block_folder_path="/Users/matteolombardi/Desktop/tesi/CookieBlock-Consent-Classifier"
cookie_block_predict_class_script="predict_class.py"
cookie_block_model="models/xgbmodel_full_20210517_204300.xgb"

cd "$cookie_block_folder_path"

python3 "$cookie_block_predict_class_script" "$cookie_block_model" "$json_out"

echo "COOKIEBLOCK PREDICTION COMPLETED"
echo "COOKIEBLOCK REPORT"

# Return in current directory and execute the report script
cd "$current_directory"
predictions="/Users/matteolombardi/Desktop/tesi/CookieBlock-Consent-Classifier/predictions.json"

node violation_report.js "$url" "$predictions" "$consent0" "$consent1" "$consent2" "$consent3"

exit 0