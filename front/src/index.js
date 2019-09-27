import React from 'react';
import ReactDOM from 'react-dom';
import {
  View, Panel, PanelHeader, Group, List, Cell, Avatar, Footer,
  HeaderButton, CellButton, Root, PanelHeaderContent, Epic, platform, 
  Tabbar, TabbarItem, Search, HeaderContext, Input, FormLayout, Button,
  Select, IOS
} from '@vkontakte/vkui';
import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import Icon24Back from '@vkontakte/icons/dist/24/back';
import Icon24Add from '@vkontakte/icons/dist/24/add';
import Icon28Menu from '@vkontakte/icons/dist/28/menu';
import Icon16Dropdown from '@vkontakte/icons/dist/16/dropdown';
import Icon28DoneOutline from '@vkontakte/icons/dist/28/done_outline';
import Icon28AddOutline from '@vkontakte/icons/dist/28/add_outline';
import Icon28User from '@vkontakte/icons/dist/28/user';
import Icon24Newsfeed from '@vkontakte/icons/dist/24/newsfeed';
import '@vkontakte/vkui/dist/vkui.css';
import * as connect from '@vkontakte/vkui-connect';
import axios from 'axios';

const osname = platform();

connect.send("VKWebAppInit", {});

class VKchallenge extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        name_task : "",
        desc_task : "",
        value_task : "",
        name : "",
        desc : "",
        complete : "",
        hash : "",
        publ : "",
        community : "",

        activeStory: 'feed',
        activeView: "view1",
        challenge_obj: {},
        challenges: {},
        user_obj: {connected_groups : []},
        user_obj_vk: {},
        task_list : [],
        token: ""
      };
      this.onChange = this.onChange.bind(this);
      this.onStoryChange = this.onStoryChange.bind(this);
      this.toggleContext = this.toggleContext.bind(this);
      this.select = this.select.bind(this);
    }
  
    onStoryChange(e) {
      this.setState({ activeStory: e.currentTarget.dataset.story })
    }
  
    toggleContext() {
      this.setState({ contextOpened: !this.state.contextOpened });
    }
  
    select(e) {
      const mode = e.currentTarget.dataset.mode;
      this.setState({ mode });
      requestAnimationFrame(this.toggleContext);
    }
  
    componentDidMount() {
      connect.send("VKWebAppSetLocation", {"location": "hash"});
      connect.subscribe((e) => {
        console.log(window.location.hash);
        if (e.detail.type === "VKWebAppGetUserInfoResult") {
          this.state.user_obj_vk = e.detail.data;
          this.getUser();
        }
        else if (e.detail.type === "VKWebAppAccessTokenReceived") {
          this.state.token = e.detail.data.access_token;
          connect.send("VKWebAppCallAPIMethod", {
            "method": "groups.getById",
            "params": { "group_id": "186902119", "v": "5.101", "access_token": this.state.token }
          });
        }
        else if (e.detail.type === "VKWebAppCallAPIMethodResult") {
          { alert(e.detail.data.response[0].is_admin) }
        }
      });
      connect.send("VKWebAppGetUserInfo", {});
      connect.send("VKWebAppGetAuthToken", { "app_id": 7138408, "scope": "groups,friends" });
    }

    componentDidUpdate() {
      if (this.state.user_obj.connected_groups.length == 0) {
        this.getUser();
      }
    }
  
    getUser() {
      axios.get(`http://192.168.43.150:5000/get_user_info?user_id=67880703`)
        .then((response) => {
          alert(response)
          this.setState({user_obj : response.data.result});
        })  
        .catch((error) => {
          console.log(error);
        });
    }
  
    getChallenge(usr_id) {
      axios.get(`https://cors-anywhere.herokuapp.com/http://192.168.43.150:5000/get_challenge_info?challenge_id=${usr_id}`)
        .then((response) => {
          this.state.challenge_obj = response.data.result;
        })
        .catch((error) => {
          console.log(error);
        });
    }

    postChallenge() {
      axios.post('http://192.168.43.150:5000/create_challenge', {
        user_id: this.state.user_obj_vk.id,
        name: this.state.name,
        description: this.state.desc,
        complete_message: this.state.complete,
        tasks: this.state.tasks,
        max_participants: this.state.max,
        group_publisher: this.state.publ
      })
        .then(function (response) {
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  
    onChange(e) {
      const { name, value } = e.currentTarget;
      this.setState({ [name]: value });
    }
  
    render() {
      return (
        <Epic activeStory={this.state.activeStory} tabbar={
          <Tabbar>
            <TabbarItem
              onClick={this.onStoryChange}
              selected={this.state.activeStory === 'feed'}
              data-story="feed"
              text="Лента"
            ><Icon24Newsfeed /></TabbarItem>
            <TabbarItem
              onClick={this.onStoryChange}
              selected={this.state.activeStory === 'index'}
              data-story="index"
              text="Новости"
            ><Icon28Menu /></TabbarItem>
            <TabbarItem
              onClick={this.onStoryChange}
              selected={this.state.activeStory === 'view2'}
              data-story="view2"
              text="Поиск"
            ><Icon28DoneOutline /></TabbarItem>
            <TabbarItem
              onClick={this.onStoryChange}
              selected={this.state.activeStory === 'view4'}
              data-story="view4"
              text="Создать"
            ><Icon28AddOutline /></TabbarItem>
            <TabbarItem
              onClick={this.onStoryChange}
              selected={this.state.activeStory === 'more'}
              data-story="more"
              text="Профиль"
            ><Icon28User /></TabbarItem>
          </Tabbar>
        }>
          <View activePanel="feed_panel" id="feed">
            <Panel id="feed_panel">
              <PanelHeader>
                feed
              </PanelHeader>
            </Panel>
          </View>

          <View activePanel="list" id="index">
            <Panel id="list">
              <PanelHeader noShadow>
                <PanelHeaderContent aside={<Icon16Dropdown />} onClick={this.toggleContext}>
                  Communities
                </PanelHeaderContent>
              </PanelHeader>
  
              <HeaderContext opened={false} onClose={this.toggleContext}>
                <List>
                  <Cell
                    before={<Icon24Back />}
                    asideContent={this.state.mode === 'all' ? <Icon24Back fill="var(--accent)" /> : null}
                    onClick={this.select}
                    data-mode="all"
                  >
                    Communities
                </Cell>
                  <Cell
                    before={<Icon24Back />}
                    asideContent={this.state.mode === 'managed' ? <Icon24Back fill="var(--accent)" /> : null}
                    onClick={this.select}
                    data-mode="managed"
                  >
                    Managed Communities
                </Cell>
                </List>
              </HeaderContext>
              <Group>
                челленджи
              </Group>
            </Panel>
          </View>
  
          <View activePanel="brand" id="view2">
            <Panel id="brand">
              <PanelHeader>
                Таб
              </PanelHeader>
            </Panel>
          </View>
  
          <View activePanel="new-user" id="view4">
            <Panel id="new-user" theme="white">
              <PanelHeader > Новый челлендж</PanelHeader>
                <FormLayout>
                  <Input value={this.state.name} top="Название" name="name" onChange={this.onChange} />
                  <Input value={this.state.desc} top="Описание" name="desc" onChange={this.onChange} />
                  <Input value={this.state.complete} top="Сообщение по завершении" name="complete" onChange={this.onChange} />
                  <Input value={this.state.hash} top="Хештег челленджа" name="hash" onChange={this.onChange} />
                  <Input top="Макс. участников" name="max" onChange={this.onChange} />
                  {this.state.user_obj.connected_groups.length > 0 &&
                    <Select placeholder="От имени группы" name="community" onChange={this.onChange} >
                      {this.state.user_obj.connected_groups.map((item) => (
                          <option key={item.group_id} value={item.group_id}>{item.group_name}</option>
                      ))}
                    </Select>
                  }
                  <Group title="Задания">
                  {this.state.task_list.length > 0 &&
                      <List>
                        {this.state.task_list.map((item, index) => (
                          <Cell key={item} removable onRemove={() => {
                            this.setState({
                              task_list: [...this.state.task_list.slice(0, index), ...this.state.task_list.slice(index + 1)]
                            })
                          }}>Тип: {item.type} <br/> Описание: {item.desc}</Cell>
                        ))}
                      </List>
                  }
               <CellButton onClick={() => { this.setState({ activeStory: 'task' }) }}   before={<Icon24Add />} >Добавить задание</CellButton>
                  </Group>
                  <Button size="xl">Создать</Button>
                </FormLayout>
            </Panel>
          </View>

          <View activePanel="new_task" id="task">
            <Panel id="new_task" theme="white">
              <PanelHeader left={<HeaderButton  onClick={() => { this.setState({ activeStory: 'view4' }) }}>{osname === IOS ? <Icon28ChevronBack /> : <Icon24Back />}</HeaderButton>} >Добавить задание</PanelHeader>
                <FormLayout>
                  <Select placeholder="Тип" name="name_task" onChange={this.onChange} >
                    <option value="Хештег">Хештег</option>
                    <option value="Репост">Репост</option>
                    <option value="Подписка">Подписка</option>
                    <option value="Отметка">Отметка в посте</option>
                  </Select>
                  <Input top="Описание" name="desc_task" onChange={this.onChange} />
                  <Input top="Значение" name="value_task" onChange={this.onChange} />
                  <Button onClick={() =>{this.state.task_list.push({type:this.state.name_task,
                  desc: this.state.desc_task, value: this.state.value_task }); this.setState({ activeStory: 'view4' }) }} size="xl" >Добавить</Button>
                </FormLayout>
            </Panel>
          </View>
  
          <View id="more" activePanel="more">
            <Panel id="more">
              <PanelHeader>
                <PanelHeaderContent
                  status="Личный кабинет"
                  before={<Avatar size={40} src={this.state.user_obj_vk.photo_200} />}>
                  {this.state.user_obj_vk.first_name} {this.state.user_obj_vk.last_name}
                </PanelHeaderContent>
              </PanelHeader>
            </Panel>
          </View>
        </Epic>
      )
    }
  }

  <VKchallenge />
  ReactDOM.render(<VKchallenge />, document.getElementById('root'));  