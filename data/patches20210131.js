module.exports = [
    // re-verified on 20210131
    {file: 'sb_BetterPregnancy\\Scenes\\childcare.lpscene', command: 'replace', params: {value: 'End', replacer: 'EndIf'}, line: 226},
    {file: 'sb_PartyAndNightlife\\Scenes\\corruption\\co_vi_strippoker_femalecompanion.lpscene', command: 'replace', params: {value: 'If', replacer: 'ElseIf'}, line: 116},
    {file: 'sb_PimpYourGirl\\Scenes\\sexwork\\offer_pimp_service.lpscene', command: 'insert', params: {value: 'EndIf'}, line: 184},
    {file: 'sb_PimpYourGirl\\Scenes\\sexwork\\instaglam\\instaglam_companion.lpscene', command: 'replace', params: {value: 'Endif', replacer: ''}, line: 241},
    {file: 'sb_TheNewGoodbye\\Scenes\\companion\\goodbye_companion.lpscene', command: 'insert', params: {value: 'EndIf'}, line: 3531},
    {file: 'sb_TheNewGoodbye\\Scenes\\corruption\\co_vi_bdsmerotica.lpscene', command: 'replace', params: {value: 'Actor:masochist < -75', replacer: 'If Actor:masochist < -75'}, line: 40},
    {file: 'sb_TheNewGoodbye\\Scenes\\home\\caught_masturbating.lpscene', command: 'insert', params: {value: 'EndIf'}, line: 81},

    // new 20210131
    {file: 'sb_TheNewGoodbye\\DirtyTalks\\sb_NTR_others_cum_licking_restricted.lptalk', command: 'replace', params: {value: '&& &&', replacer: '&&'}, line: 29},

    {file: 'r8kie_additional_activities\\Scenes\\peeping_in_workplace.lpscene', command: 'replace', params: {value: 'Actor.hide', replacer: 'Actor.hide()'}, line: 11},
    {file: 'r8kie_additional_activities\\Scenes\\peeping_in_workplace.lpscene', command: 'replace', params: {value: 'Actor.hide', replacer: 'Actor.hide()'}, line: 13},
    {file: 'r8kie_additional_activities\\Scenes\\peeping_in_workplace.lpscene', command: 'replace', params: {value: '0 ::', replacer: '0::'}, line: 207},
    {file: 'r8kie_additional_activities\\Scenes\\peeping_in_workplace.lpscene', command: 'replace', params: {value: '1 ::', replacer: '1::'}, line: 208},
    {file: 'r8kie_additional_activities\\Scenes\\peeping_in_workplace.lpscene', command: 'replace', params: {value: '2 ::', replacer: '2::'}, line: 209},
    {file: 'r8kie_additional_activities\\Scenes\\watching_TV_dog.lpscene', command: 'replace', params: {value: 'Player(Happy)', replacer: 'Player(Happy)::'}, line: 39},
    {file: 'r8kie_additional_activities\\Scenes\\changing_clothes_home.lpscene', command: 'replace', params: {value: '&& &&', replacer: '&&'}, line: 4},

    {file: 'sb_BetterPregnancy\\Scenes\\beauty\\reverse_vasectomy.lpscene', command: 'replace', params: {value: '1:.', replacer: '1::'}, line: 22},
    {file: 'sb_BetterPregnancy\\Scenes\\beauty\\vasectomy.lpscene', command: 'replace', params: {value: '1:.', replacer: '1::'}, line: 22},
    {file: 'sb_BetterPregnancy\\Scenes\\beauty\\pregnancy_check.lpscene', command: 'replace', params: {value: 'show(2))', replacer: 'show(2)'}, line: 346},
    {file: 'sb_BetterPregnancy\\Scenes\\meet_random\\meet_new_person.lpscene', command: 'replace', params: {value: '[!InterestedInPC && New_Person:rapportwithplayer > 0)] || [!InterestedInPC && Player:attractiveness > New_Person:attractiveness)]', replacer: '[!InterestedInPC && New_Person:rapportwithplayer > 0] || [!InterestedInPC && Player:attractiveness > New_Person:attractiveness]'}, line: 87},

    {file: 'sb_PartyAndNightlife\\Scenes\\social\\house_party.lpscene', command: 'replace', params: {value: 'Guest5(Happy) ::', replacer: 'Guest5(Happy)::'}, line: 1115},

    {file: 'vin_Base\\Scenes\\crime\\prison_warden_cms.lpscene', command: 'replace', params: {value: 'Actor3:', replacer: 'Actor3::'}, line: 552},
    {file: 'vin_Base\\Scenes\\gym\\futa_hard_sport_cms.lpscene', command: 'replace', params: {value: 'Actor:', replacer: 'Actor::'}, line: 29},
    {file: 'vin_Base\\Scenes\\uni_student\\fraternity_misogyny.lpscene', command: 'replace', params: {value: `'No`, replacer: `"'No`}, line: 10},
    {file: 'vin_Base\\Scenes\\uni_student\\fraternity_misogyny.lpscene', command: 'replace', params: {value: `'No`, replacer: `"'No`}, line: 11},
    {file: 'vin_Base\\Scenes\\uni_student\\fraternity_misogyny.lpscene', command: 'replace', params: {value: `'No`, replacer: `"'No`}, line: 12},
    {file: 'vin_Base\\Scenes\\work\\coffee_break_spill.lpscene', command: 'replace', params: {value: `Actor:`, replacer: `Actor::`}, line: 17},
    {file: 'vin_Base\\Scenes\\work\\coffee_break_spill.lpscene', command: 'replace', params: {value: `Player:`, replacer: `Player::`}, line: 45},

    {file: 'vin_Netori\\Scenes\\maid_revenge.lpscene', command: 'replace', params: {value: `    imeout`, replacer: `    timeout`}, line: 43},
    {file: 'vin_Netori\\Scenes\\cms_ica_sep03.lpscene', command: 'replace', params: {value: `50]`, replacer: `50`}, line: 36},

    {file: 'vin_NTR\\interactions\\offer_swing.lpscene', command: 'replace', params: {value: `(()`, replacer: `()`}, line: 12},

    {file: 'vin_Pregnancy\\Scenes\\childcare.lpscene', command: 'replace', params: {value: `End`, replacer: `EndIf`}, line: 228},
    {file: 'vin_Pregnancy\\Scenes\\childcare.lpscene', command: 'replace', params: {value: `hide)`, replacer: `hide()`}, line: 473},
    {file: 'vin_Pregnancy\\Scenes\\childcare.lpscene', command: 'replace', params: {value: `Endif`, replacer: `EndWhile`}, line: 488},

    // unofficial
    {file: 'vin_Corruption\\Scenes\\fake_modeling.lpscene', command: 'replace', params: {value: `Player:`, replacer: `Player::`}, line: 23},

    {file: 'vin_Incest\\Scenes\\cms_cuck_dad.lpscene', command: 'replace', params: {value: `Actor:`, replacer: `Actor::`}, line: 14},
    {file: 'vin_Incest\\Scenes\\cms_cuck_dad_impregnate.lpscene', command: 'replace', params: {value: `Actor:`, replacer: `Actor::`}, line: 14},
    {file: 'vin_Incest\\Scenes\\cms_cuck_dad_passive.lpscene', command: 'replace', params: {value: `Player:`, replacer: `Player::`}, line: 14},
    {file: 'vin_Incest\\Scenes\\family_blackmails.lpscene', command: 'replace', params: {value: `Actor: incest`, replacer: `Actor:incest`}, line: 31},
    {file: 'vin_Incest\\Scenes\\incest_bathroom_cms.lpscene', command: 'replace', params: {value: `Player:`, replacer: `Player::`}, line: 15},
    {file: 'vin_Incest\\Scenes\\incest_bathroom_cms.lpscene', command: 'replace', params: {value: `Player(Surprised):`, replacer: `Player(Surprised)::`}, line: 18},
    {file: 'vin_Incest\\Scenes\\incest_bathroom_cms.lpscene', command: 'replace', params: {value: `Player:`, replacer: `Player::`}, line: 31},
    {file: 'vin_Incest\\Scenes\\incest_porn.lpscene', command: 'replace', params: {value: `Player(Pain):`, replacer: `Player(Pain)::`}, line: 9},
    {file: 'vin_Incest\\Scenes\\family_possessive.lpscene', command: 'replace', params: {value: '&& &&', replacer: '&&'}, line: 4},
    {file: 'vin_Incest\\Scenes\\family_takes_shopping.lpscene', command: 'replace', params: {value: '&& &&', replacer: '&&'}, line: 5},

    {file: 'vin_Bestiality\\Scenes\\horse\\family_peep_bestiality_h.lpscene', command: 'replace', params: {value: '&& &&', replacer: '&&'}, line: 4},
    {file: 'vin_Bestiality\\Interactions\\offer_bull_best.lpscene', command: 'replace', params: {value: `Endif)`, replacer: `Endif`}, line: 32},

]