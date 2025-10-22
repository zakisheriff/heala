import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {

  return (
    <NativeTabs>

      <NativeTabs.Trigger name="index" options={{ title: 'Home', headerShown: false }}>
        <Label>Home</Label>
        <Icon sf={"house.fill"} drawable='ic_menu_view'/>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile" options={{ title: 'Profile', headerShown: false }}>
        <Label>Profile</Label>
        <Icon sf={"person.fill"} drawable='sym_def_app_icon'/>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="history" options={{ title: 'History', headerShown: false }}>
        <Label>History</Label>
        <Icon sf={"clock.fill"} drawable="ic_menu_recent_history"/>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="upload" options={{ title: 'Upload', headerShown: false }}>
        <Label>Upload</Label>
        <Icon sf={"plus.app"} drawable='ic_menu_upload'/>
      </NativeTabs.Trigger>


    </NativeTabs>
    
  );
}
