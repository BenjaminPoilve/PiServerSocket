#!/bin/bash

until obs --startstreaming; do
    echo "OBS crashed with exit code $?.  Respawning.." >&2
    sleep 1
done
