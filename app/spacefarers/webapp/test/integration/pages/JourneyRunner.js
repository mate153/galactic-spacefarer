sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"galactic/spacefarer/spacefarers/spacefarers/test/integration/pages/SpacefarersList.gen"
], function (JourneyRunner, SpacefarersListGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('galactic/spacefarer/spacefarers/spacefarers') + '/test/flp.html#app-preview',
        pages: {
			onTheSpacefarersListGenerated: SpacefarersListGenerated
        },
        async: true
    });

    return runner;
});

