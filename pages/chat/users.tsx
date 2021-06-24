import React, { useState, useEffect, useContext } from 'react';
import { Table, Typography } from 'antd';
import { formatDistanceToNow } from 'date-fns';
import { SortOrder } from 'antd/lib/table/interface';

import { ServerStatusContext } from '../../utils/server-status-context';

import { CONNECTED_CLIENTS, VIEWERS_OVER_TIME, fetchData } from '../../utils/apis';

const FETCH_INTERVAL = 60 * 1000; // 1 min

export default function ChatUsers() {
  const context = useContext(ServerStatusContext);
  const { online } = context || {};

  const [viewerInfo, setViewerInfo] = useState([]);
  const [clients, setClients] = useState([]);

  const getInfo = async () => {
    try {
      const result = await fetchData(VIEWERS_OVER_TIME);
      setViewerInfo(result);
    } catch (error) {
      console.log('==== error', error);
    }

    try {
      const result = await fetchData(CONNECTED_CLIENTS);
      setClients(result);
    } catch (error) {
      console.log('==== error', error);
    }
  };

  useEffect(() => {
    let getStatusIntervalId = null;

    getInfo();
    if (online) {
      getStatusIntervalId = setInterval(getInfo, FETCH_INTERVAL);
      // returned function will be called on component unmount
      return () => {
        clearInterval(getStatusIntervalId);
      };
    }

    return () => [];
  }, [online]);

  // todo - check to see if broadcast active has changed. if so, start polling.

  if (!viewerInfo.length) {
    return 'no info';
  }

  const columns = [
    {
      title: 'User name',
      dataIndex: 'username',
      key: 'username',
      render: username => username || '-',
      sorter: (a, b) => a.username - b.username,
      sortDirections: ['descend', 'ascend'] as SortOrder[],
    },
    {
      title: 'Messages sent',
      dataIndex: 'messageCount',
      key: 'messageCount',
      sorter: (a, b) => a.messageCount - b.messageCount,
      sortDirections: ['descend', 'ascend'] as SortOrder[],
    },
    {
      title: 'Connected Time',
      dataIndex: 'connectedAt',
      key: 'connectedAt',
      render: time => formatDistanceToNow(new Date(time)),
      sorter: (a, b) => new Date(a.connectedAt).getTime() - new Date(b.connectedAt).getTime(),
      sortDirections: ['descend', 'ascend'] as SortOrder[],
    },
    {
      title: 'User Agent',
      dataIndex: 'userAgent',
      key: 'userAgent',
    },
    {
      title: 'Location',
      dataIndex: 'geo',
      key: 'geo',
      render: geo => (geo ? `${geo.regionName}, ${geo.countryCode}` : '-'),
    },
  ];

  return (
    <>
      <div>
        <Typography.Title>Connected</Typography.Title>
        <Table dataSource={clients} columns={columns} rowKey={row => row.clientID} />
        <p>
          <Typography.Text type="secondary">
            Visit the{' '}
            <a
              href="https://owncast.online/docs/viewers/?source=admin"
              target="_blank"
              rel="noopener noreferrer"
            >
              documentation
            </a>{' '}
            to configure additional details about your viewers.
          </Typography.Text>{' '}
        </p>
      </div>
    </>
  );
}