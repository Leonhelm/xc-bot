export const getBuildTokens = (buildingsPage) => {
  const dataRaw = buildingsPage.split('<script type="application/json" id="update-page-json">').at(1).split('</script>').at(0);
  const data = JSON.parse(dataRaw);
  const buildTokens = {};

  data.transmissions.controller.params.buildings.forEach(({ build_id, build_token }) => {
    buildTokens[build_id] = build_token;
  });

  return buildTokens;
}
