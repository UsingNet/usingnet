/**
 * Created by jhli on 15-12-16.
 */
Ext.define('Admin.view.settings.voiceService.VoiceServiceModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.voiceService',
    stores: {
        voice: {
            type: 'mediaVoice'
        }
    },
    data: {}
});
