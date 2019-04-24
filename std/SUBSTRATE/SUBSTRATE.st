service SUBSTRATE {
  // Runs as part of Http Birth and is how the substrate connects
  // a web server (or web reception infrastructure) to the Http
  // component.
  httpConnection ():any -> "./blank.js"

  // Runs in front of Http's matcher and normalizes the substrate's
  // own Http syntax into that expected by Http.
  httpReception ():any -> "./blank.js"
}
