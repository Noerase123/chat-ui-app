"use client"

import { useEffect, useState } from 'react';
import {
  SendBirdProvider,
  ChannelList,
  Channel,
  ChannelSettings,
  sendbirdSelectors,
  useSendbirdStateContext
} from '@sendbird/uikit-react';
import '@sendbird/uikit-react/dist/index.css';
import axios from 'axios';
import { uuid } from 'uuidv4';

function fetchApi() {
  const appID = process.env.APP_ID;
  const apiToken = process.env.API_TOKEN;
  const instance = axios.create({
    baseURL: `https://api-${appID}.sendbird.com`,
    headers: {
      'Api-Token': apiToken,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  })
  return instance;
}

function apiCalls(cb?: (payload: any) => void) {
  return {
    fetchMessagesInChannel: async (channelUrl: string) => {
      const { data } = await fetchApi().get(`/v3/group_channels/${channelUrl}/messages/total_count`)
      cb?.(data.total);
    },
    createUser: async (payload: {
      user_id: string;
      nickname: string;
      profile_url?: string;
      profile_file?: string;
    }) => {
      const { data } = await fetchApi().post('/v3/users', {
        ...payload,
        profile_url: ''
      });
      cb?.(data.user_id);
    }
  }
}

function CustomizedApp() {
  const [currentChannel, setCurrentChannel] = useState<any>(null);
  const currentChannelUrl = currentChannel ? currentChannel.url : "";
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [totalMessagesInChannel, setTotalMessagesInChannel] = useState<number>(0);

  const globalStore = useSendbirdStateContext();
  const getUpdateInfo = sendbirdSelectors.getUpdateUserInfo(globalStore);
  // const getCreateChannel = sendbirdSelectors.getCreateGroupChannel(globalStore);

  console.log('totalMessagesInChannel', totalMessagesInChannel);

  return (
    <main>
      <div className="flex flex-row items-center">
        <div className="h-[100vh]">
          <ChannelList
            onChannelSelect={channel => {
              console.log('channel', channel);
              setCurrentChannel(channel);
              apiCalls((payload) => {
                setTotalMessagesInChannel(payload.total);
              }).fetchMessagesInChannel(channel?.url!);
            }}
            allowProfileEdit
            onProfileEditSuccess={(user) => {
              const nickname = user.nickname;
              const profileUrl = user.plainProfileUrl;
              getUpdateInfo(nickname, profileUrl);
            }}
          />
        </div>
        <div className="h-[100vh] flex-1">
          <Channel
            channelUrl={currentChannelUrl}
            onChatHeaderActionClick={() => {
              setShowSettings(!showSettings);
            }}
          />
        </div>
        {showSettings && (
          <div className='h-[100vh]'>
            <ChannelSettings
              channelUrl={currentChannelUrl}
              onCloseClick={() => {
                setShowSettings(false);
              }}
            />
          </div>
        )}
      </div>
    </main>
  );
}

export default function Home() {
  const [newUserID, setNewUserID] = useState('');

  useEffect(() => {
    apiCalls((payload) => {
      setNewUserID(payload.user_id)
    }).createUser({
      user_id: 'testing123',
      nickname: 'new user'
    })
  }, []);
  
  return (
    <div>
      <SendBirdProvider
        appId={process.env.APP_ID as string}
        userId={newUserID}
      >
        <CustomizedApp />
      </SendBirdProvider>
    </div>
  );
}
