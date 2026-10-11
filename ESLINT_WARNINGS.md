# ESLint Warnings — Full Inventory

**Generated:** 2026-08-25
**Command:** `npx eslint src/`
**Total warnings:** 136 across 5 rule types
**Errors:** 0

All entries below are pre-existing — none were introduced by the Game Center doc/fetch work done in this session. Provided for a review pass: which are safe auto-cleanup (mostly unused imports) versus which want a closer look (duplicate props, a hook dependency list, a deps mismatch).

## Summary by rule

| Rule | Count | Nature |
|---|---|---|
| `no-unused-vars` | 125 | Imports or variables never referenced. Bulk of the total — almost all safe to delete, but check each: a variable assigned and never read can occasionally indicate a bug (wrong var used) rather than dead code. |
| `react-hooks/exhaustive-deps` | 4 | A hook's dependency array includes something unnecessary (or is missing something) per the hook's actual body. Worth a real look — this rule catches real staleness bugs as often as false positives. |
| `no-mixed-operators` | 4 | `>=` and `===` combined without parentheses. Style-only — JS precedence is unambiguous here, ESLint just wants it visually disambiguated. |
| `react/jsx-no-duplicate-props` | 2 | Same prop name passed twice on one JSX element. Worth checking each: the second occurrence silently wins, so if both were meant to do something the first is dead and possibly a bug. |
| `no-useless-escape` | 1 | A backslash-escaped character that doesn't need escaping in that context. Cosmetic. |

---

## Full listing by rule

### `no-unused-vars` (125)

| File | Line:Col | Message |
|---|---|---|
| `src/components/atoms/cards/DiscoveryCard.js` | 2:21 | 'Grid' is defined but never used. |
| `src/components/game/page/GamePageShell.js` | 1:10 | 'Box' is defined but never used. |
| `src/components/game/page/boxscore/BoxScoreTab.js` | 1:15 | 'Text' is defined but never used. |
| `src/components/game/page/boxscore/BoxScoreTab.js` | 1:21 | 'VStack' is defined but never used. |
| `src/components/game/page/boxscore/BoxScoreV2.js` | 1:10 | 'useMemo' is defined but never used. |
| `src/components/game/page/boxscore/BoxScoreV2.js` | 1:19 | 'useState' is defined but never used. |
| `src/components/game/page/panels/StubPanel.js` | 1:10 | 'Box' is defined but never used. |
| `src/components/game/page/summary/GameInfoPassport.js` | 7:3 | 'HStack' is defined but never used. |
| `src/components/game/page/summary/GameInfoPassport.js` | 8:3 | 'Grid' is defined but never used. |
| `src/components/game/page/summary/GameSummaryTabV2.js` | 28:3 | 'LineChart' is defined but never used. |
| `src/components/game/page/summary/GameSummaryTabV2.js` | 32:3 | 'CartesianGrid' is defined but never used. |
| `src/components/game/page/summary/GameSummaryTabV2.js` | 37:3 | 'ReferenceDot' is defined but never used. |
| `src/components/game/page/summary/GameSummaryTabV2.js` | 69:7 | 'getTeamName' is assigned a value but never used. |
| `src/components/game/page/summary/GameSummaryTabV2.js` | 149:7 | 'LogoWatermark' is assigned a value but never used. |
| `src/components/game/page/summary/GameSummaryTabV2.js` | 192:7 | 'Hairline' is assigned a value but never used. |
| `src/components/game/page/summary/GameSummaryTabV2.js` | 216:7 | 'HeroStat' is assigned a value but never used. |
| `src/components/game/page/summary/GloryMVPPanel.js` | 1:21 | 'Grid' is defined but never used. |
| `src/components/game/page/teamstats/DataRoomTab.js` | 2:10 | 'useMemo' is defined but never used. |
| `src/components/game/page/teamstats/DataRoomTab.js` | 56:9 | 'homeSrc' is assigned a value but never used. |
| `src/components/game/page/teamstats/TeamStatsTab.js` | 225:9 | 'awaySec' is assigned a value but never used. |
| `src/components/game/page/teamstats/TeamStatsTab.js` | 226:9 | 'homeSec' is assigned a value but never used. |
| `src/components/game/page/teamstats/useGameAnalytics.js` | 8:7 | 'pct' is assigned a value but never used. |
| `src/components/game/page/teamstats/useGameAnalytics.js` | 9:7 | 'signed' is assigned a value but never used. |
| `src/components/game/page/teamstats/useGameAnalytics.js` | 14:7 | 'ratio' is assigned a value but never used. |
| `src/components/game/summary/DriveLedger.js` | 4:10 | 'fmt' is defined but never used. |
| `src/components/game/summary/RawStats.js` | 1:10 | 'Box' is defined but never used. |
| `src/components/molecules/data/SchoolsDirectoryTriFlavor.js` | 13:25 | 'Calendar' is defined but never used. |
| `src/components/molecules/data/SchoolsHeroBanner.js` | 1:27 | 'Button' is defined but never used. |
| `src/components/molecules/data/SchoolsHeroBanner.js` | 2:18 | 'RouterLink' is defined but never used. |
| `src/components/molecules/game/GameProductionDefenseProd.js` | 16:10 | 'getDisplayName' is defined but never used. |
| `src/components/molecules/game/GameProductionPanels.js` | 19:3 | 'getDisplayName' is defined but never used. |
| `src/components/molecules/game/GameProductionPanels.js` | 39:7 | 'getTeamLabel' is assigned a value but never used. |
| `src/components/molecules/game/GameProductionPanels.js` | 40:7 | 'getTeamColor' is assigned a value but never used. |
| `src/components/molecules/game/GameProductionPanels.js` | 519:9 | 'teamStats' is assigned a value but never used. |
| `src/components/molecules/game/GameProductionPanels.js` | 593:9 | 'totalTDs' is assigned a value but never used. |
| `src/components/molecules/game/GameProductionPanels.js` | 595:9 | 'totalCompPct' is assigned a value but never used. |
| `src/components/molecules/game/GameProductionPanels.js` | 596:9 | 'totalYpa' is assigned a value but never used. |
| `src/components/molecules/game/GameProductionPanels.js` | 778:9 | 'teamStats' is assigned a value but never used. |
| `src/components/molecules/game/GameProductionPanels.js` | 849:9 | 'spotlightStopped' is assigned a value but never used. |
| `src/components/molecules/schools/RosterBreakdownModules.js` | 2:27 | 'SimpleGrid' is defined but never used. |
| `src/components/molecules/schools/SchoolsHeroBanner.js` | 1:34 | 'Grid' is defined but never used. |
| `src/components/molecules/schools/SchoolsHeroBanner.js` | 2:18 | 'RouterLink' is defined but never used. |
| `src/components/organisms/CountdownTimer.js` | 1:27 | 'Container' is defined but never used. |
| `src/components/organisms/FeaturedPlayer.js` | 1:27 | 'Badge' is defined but never used. |
| `src/components/organisms/MiniStandings.js` | 1:27 | 'Container' is defined but never used. |
| `src/components/organisms/MomentumGraph.js` | 1:27 | 'Container' is defined but never used. |
| `src/components/organisms/MomentumGraph.js` | 2:22 | 'TrendingDown' is defined but never used. |
| `src/components/organisms/MomentumGraph.js` | 2:36 | 'Minus' is defined but never used. |
| `src/components/organisms/tabs/DashTab.js` | 10:3 | 'RosterDepthCard' is defined but never used. |
| `src/components/organisms/tabs/ScheduleTab.js` | 5:37 | 'ArrowRight' is defined but never used. |
| `src/components/organisms/tabs/ScheduleTab.js` | 29:7 | 'getWeek' is assigned a value but never used. |
| `src/components/organisms/test/CoachesHubExpA.js` | 2:33 | 'Image' is defined but never used. |
| `src/components/organisms/test/CoachesHubExpA.js` | 2:47 | 'Switch' is defined but never used. |
| `src/components/organisms/test/CoachesHubExpA.js` | 2:55 | 'FormControl' is defined but never used. |
| `src/components/organisms/test/CoachesHubExpA.js` | 2:68 | 'FormLabel' is defined but never used. |
| `src/components/organisms/test/CoachesHubExpA.js` | 3:58 | 'Award' is defined but never used. |
| `src/components/organisms/test/ConferenceFootprintA.js` | 2:15 | 'Circle' is defined but never used. |
| `src/components/organisms/test/ConferenceFootprintA.js` | 64:7 | 'Chip' is assigned a value but never used. |
| `src/components/organisms/test/ConferenceFootprintLab.js` | 3:49 | 'Marker' is defined but never used. |
| `src/components/organisms/test/GameBoxScorePassing.js` | 31:7 | 'fmtPct' is assigned a value but never used. |
| `src/components/organisms/test/GameBoxScorePassing.js` | 32:7 | 'fmtNum' is assigned a value but never used. |
| `src/components/organisms/test/GameBoxScorePassing.js` | 189:7 | 'buildAvatarLookup' is assigned a value but never used. |
| `src/components/organisms/test/GameInfoPassportLab.js` | 17:7 | 'mockMetaMissing' is assigned a value but never used. |
| `src/components/organisms/test/GameProductionDefenseDownFortress.js` | 10:10 | 'ShieldCheck' is defined but never used. |
| `src/components/organisms/test/GameProductionDefensePressureProfile.js` | 9:3 | 'CircularProgress' is defined but never used. |
| `src/components/organisms/test/GameProductionSharedElements.js` | 1:27 | 'Fragment' is defined but never used. |
| `src/components/organisms/test/GameProductionSharedElements.js` | 8:3 | 'HStack' is defined but never used. |
| `src/components/organisms/test/GameProductionSharedElements.js` | 9:3 | 'Button' is defined but never used. |
| `src/components/organisms/test/GameProductionSpecialTeamsD.js` | 3:42 | 'Badge' is defined but never used. |
| `src/components/organisms/test/GameProductionSpecialTeamsD.js` | 34:7 | 'gradeColor' is assigned a value but never used. |
| `src/components/organisms/test/GameSummaryCards.js` | 2:48 | 'Progress' is defined but never used. |
| `src/components/organisms/test/GameSummaryCards.js` | 2:58 | 'Divider' is defined but never used. |
| `src/components/organisms/test/GameSummaryCards.js` | 4:10 | 'cleanName' is defined but never used. |
| `src/components/organisms/test/GameSummaryCards.js` | 4:21 | 'fmt' is defined but never used. |
| `src/components/organisms/test/GameSummaryCards.js` | 4:26 | 'pct' is defined but never used. |
| `src/components/organisms/test/GameSummaryCards.js` | 606:11 | 'team' is assigned a value but never used. |
| `src/components/organisms/test/GamesHubNewsClippingA.js` | 2:49 | 'Center' is defined but never used. |
| `src/components/organisms/test/QGameBoxScore.js` | 1614:7 | 'totalOppPlays' is assigned a value but never used. |
| `src/components/organisms/test/QGameBoxScore.js` | 2044:9 | 'avatarMap' is assigned a value but never used. |
| `src/components/organisms/test/SchoolWikiMuseumLab.js` | 2:35 | 'Image' is defined but never used. |
| `src/components/organisms/test/SchoolWikiMuseumLab.js` | 3:10 | 'History' is defined but never used. |
| `src/components/organisms/test/SchoolWikiMuseumLab.js` | 3:26 | 'MapPin' is defined but never used. |
| `src/components/organisms/test/SchoolWikiMuseumLab.js` | 3:41 | 'Award' is defined but never used. |
| `src/components/organisms/test/TeamKPIStripA.js` | 33:9 | 'secondaryColor' is assigned a value but never used. |
| `src/components/organisms/test/TeamRosterFeatureRailA.js` | 256:7 | 'FactBlock' is assigned a value but never used. |
| `src/components/organisms/test/WeekCentralGameRowI.js` | 24:9 | 'winner' is assigned a value but never used. |
| `src/components/organisms/test/WeekCentralGameRowVariants.js` | 2:57 | 'Stack' is defined but never used. |
| `src/components/organisms/test/WeekCentralGameRowVariants.js` | 3:18 | 'Trophy' is defined but never used. |
| `src/components/organisms/test/legacy/ExperienceMatrix.js` | 398:29 | 'pyramidLevels' is assigned a value but never used. |
| `src/components/organisms/test/legacy/ExperienceMatrix.js` | 511:9 | 'getWinner' is assigned a value but never used. |
| `src/components/organisms/test/legacy/Rankings2x2Lab.js` | 9:3 | 'Grid' is defined but never used. |
| `src/components/organisms/test/legacy/RosterCommandHeader.js` | 1:43 | 'Spacer' is defined but never used. |
| `src/components/organisms/test/legacy/RosterCommandHeader.js` | 46:9 | 'navigate' is assigned a value but never used. |
| `src/components/organisms/test/legacy/RosterCommandHeader.js` | 131:9 | 'navigate' is assigned a value but never used. |
| `src/components/organisms/test/legacy/RosterCommandHeader.js` | 191:9 | 'navigate' is assigned a value but never used. |
| `src/components/organisms/test/legacy/RosterComparator.js` | 3:3 | 'Flex' is defined but never used. |
| `src/components/organisms/test/legacy/RosterComparator.js` | 7:3 | 'Spacer' is defined but never used. |
| `src/components/organisms/test/legacy/RosterComparator.js` | 188:7 | 'StackedBar' is assigned a value but never used. |
| `src/components/organisms/test/legacy/RosterComparator.js` | 220:9 | 'navigate' is assigned a value but never used. |
| `src/components/organisms/test/legacy/RosterComparator.js` | 524:9 | 'navigate' is assigned a value but never used. |
| `src/components/organisms/test/legacy/RosterComparator.js` | 674:9 | 'navigate' is assigned a value but never used. |
| `src/components/organisms/test/legacy/RosterComparatorLab.js` | 2:35 | 'HStack' is defined but never used. |
| `src/components/organisms/test/legacy/SchoolBannerMocks.js` | 1:34 | 'Grid' is defined but never used. |
| `src/components/organisms/test/legacy/SchoolBannerMocks.js` | 2:18 | 'RouterLink' is defined but never used. |
| `src/components/organisms/test/legacy/Standings2x2Lab.js` | 8:3 | 'HStack' is defined but never used. |
| `src/components/organisms/test/legacy/TeamEntryCardGridA.js` | 1:17 | 'useState' is defined but never used. |
| `src/components/organisms/test/legacy/TeamEntryCardGridA.js` | 2:53 | 'useColorModeValue' is defined but never used. |
| `src/components/organisms/test/legacy/TeamEntryCardGridB.js` | 1:17 | 'useState' is defined but never used. |
| `src/components/organisms/test/legacy/TeamEntryCardGridB.js` | 2:53 | 'useColorModeValue' is defined but never used. |
| `src/components/organisms/test/legacy/TeamEntryCardGridC.js` | 2:53 | 'useColorModeValue' is defined but never used. |
| `src/components/organisms/test/legacy/TeamEntryCardGridC.js` | 2:72 | 'VStack' is defined but never used. |
| `src/components/organisms/test/legacy/WikiBannerCopilotCardStack.js` | 2:18 | 'useMotionValue' is defined but never used. |
| `src/components/organisms/test/legacy/WikiBannerCopilotCardStack.js` | 2:34 | 'useTransform' is defined but never used. |
| `src/components/organisms/test/legacy/WikiCopilotTag.js` | 1:15 | 'Text' is defined but never used. |
| `src/data/WikiTab.js` | 1:17 | 'useEffect' is defined but never used. |
| `src/data/WikiTab.js` | 2:21 | 'Center' is defined but never used. |
| `src/pages/PageLab.js` | 11:7 | 'VIEWPORTS' is assigned a value but never used. |
| `src/pages/RosterHubPage.js` | 11:23 | 'setIsLoading' is assigned a value but never used. |
| `src/pages/RosterHubPage.js` | 12:28 | 'setContextLoading' is assigned a value but never used. |
| `src/pages/game-center/GameBoxScore.js` | 355:9 | 'f1' is assigned a value but never used. |
| `src/pages/game-center/GameBoxScore.js` | 381:9 | 'f2' is assigned a value but never used. |
| `src/pages/game-center/GameBoxScore.js` | 382:9 | 'rp' is assigned a value but never used. |
| `src/pages/game-center/GameBoxScore.js` | 436:9 | 'f1' is assigned a value but never used. |
| `src/pages/game-center/GamePage.js` | 55:9 | 'location' is assigned a value but never used. |
| `src/pages/schedule/SchedulePage.js` | 3:10 | 'useSearchParams' is defined but never used. |

### `react-hooks/exhaustive-deps` (4)

| File | Line:Col | Message |
|---|---|---|
| `src/components/game/page/summary/GameSummaryTabV2.js` | 568:6 | React Hook useMemo has an unnecessary dependency: 'awayId'. Either exclude it or remove the dependency array. |
| `src/components/molecules/game/GameProductionPanels.js` | 1244:9 | The 'teamStats' logical expression could make the dependencies of useMemo Hook (at line 1309) change on every render. Move it inside the useMemo callback. Alternatively, wrap the initialization of 'teamStats' in its own useMemo() Hook. |
| `src/components/molecules/game/GameProductionPanels.js` | 1245:9 | The 'indStats' logical expression could make the dependencies of useMemo Hook (at line 1309) change on every render. Move it inside the useMemo callback. Alternatively, wrap the initialization of 'indStats' in its own useMemo() Hook. |
| `src/components/organisms/test/GameSummaryCards.js` | 372:6 | React Hook useMemo has an unnecessary dependency: 'awayId'. Either exclude it or remove the dependency array. |

### `no-mixed-operators` (4)

| File | Line:Col | Message |
|---|---|---|
| `src/components/game/page/summary/GameSummaryTabV2.js` | 1574:102 | Unexpected mix of '>=' and '==='. Use parentheses to clarify the intended order of operations. |
| `src/components/game/page/summary/GameSummaryTabV2.js` | 1574:122 | Unexpected mix of '>=' and '==='. Use parentheses to clarify the intended order of operations. |
| `src/components/game/page/summary/GameSummaryTabV2.js` | 1578:102 | Unexpected mix of '>=' and '==='. Use parentheses to clarify the intended order of operations. |
| `src/components/game/page/summary/GameSummaryTabV2.js` | 1578:122 | Unexpected mix of '>=' and '==='. Use parentheses to clarify the intended order of operations. |

### `react/jsx-no-duplicate-props` (2)

| File | Line:Col | Message |
|---|---|---|
| `src/components/molecules/schools/RosterBreakdownModules.js` | 107:7 | No duplicate props allowed |
| `src/components/organisms/test/SchoolWikiMuseumLab.js` | 64:5 | No duplicate props allowed |

### `no-useless-escape` (1)

| File | Line:Col | Message |
|---|---|---|
| `src/components/organisms/test/legacy/RosterLineListLab.js` | 6:51 | Unnecessary escape character: \". |
