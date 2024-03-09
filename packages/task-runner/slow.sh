for i in $(seq 6); do
  # Your commands to be executed 5 times go here
  echo "Iteration: $i"
  [[ $i == 2 ]] && echo "Error message" >&2
  sleep 1
done
