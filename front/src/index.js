import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';

import React from 'react';
import ReactDOM from 'react-dom';
import {
  View, Panel, PanelHeader, Group, List, Cell, Avatar, Footer,
  HeaderButton, CellButton, Root, PanelHeaderContent, Epic, platform,
  Tabbar, TabbarItem, Search, HeaderContext, Input, FormLayout, Button,
  Select, IOS, Tabs, TabsItem, Icon24MoreHorizontal, Div, InfoRow, HorizontalScroll
} from '@vkontakte/vkui';
import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import Icon24Back from '@vkontakte/icons/dist/24/back';
import Icon24Add from '@vkontakte/icons/dist/24/add';
import Icon24Settings from '@vkontakte/icons/dist/24/settings';
import Icon28Menu from '@vkontakte/icons/dist/28/menu';
import Icon16Dropdown from '@vkontakte/icons/dist/16/dropdown';
import Icon28DoneOutline from '@vkontakte/icons/dist/28/done_outline';
import Icon28AddOutline from '@vkontakte/icons/dist/28/add_outline';
import Icon28User from '@vkontakte/icons/dist/28/user';
import Icon24Play from '@vkontakte/icons/dist/24/play';
import Icon24Pause from '@vkontakte/icons/dist/24/pause';
import Icon28Newsfeed from '@vkontakte/icons/dist/28/newsfeed';
import '@vkontakte/vkui/dist/vkui.css';
import * as connect from '@vkontakte/vkui-connect';
import axios from 'axios';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  card: {
    maxWidth: 345,
  },
  media: {
    height: 140,
  },
});


const instance = axios.create({
  headers: { 'Access-Control-Allow-Origin': "*" }
});

const osname = platform();
connect.send("VKWebAppInit", {});


class ChallengeInfo extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <React.Fragment>
        <PanelHeader left={<HeaderButton onClick={this.props.handler} >{<Icon24Back />}</HeaderButton>}> {this.props.name}</PanelHeader>
        <Group title="Описание">
          <Cell multiline>{this.props.desc}</Cell>
        </Group>
        <Group title="Кол-во участников">
          <Cell multiline>{this.props.max}</Cell>
        </Group>
      </React.Fragment>
    );
  }
}

class VKchallenge extends React.Component {
  constructor(props) {
    super(props);
    const classes = useStyles();
    this.state = {
      name_task: "",
      desc_task: "",
      value_task: "",
      name: "",
      desc: "",
      complete: "",
      hash: "",
      publ: "",
      community: "My account",
      winner: "",

      activeStory: 'feed',
      activeView: "view1",
      activeTab6: "active",
      activeTab5: "popular",
      challenge_obj: {},
      all_challenges: [],
      user_groups: [],
      challenges: {},
      user_obj: { connected_groups: [] },
      one_challenge_obj: {},
      user_obj_vk: {},
      task_list: [],
      token: "",
      groups_checked: false
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
    connect.send("VKWebAppSetLocation", { "location": "hash" });
    connect.subscribe((e) => {
      console.log(window.location.hash);
      if (e.detail.type === "VKWebAppGetUserInfoResult") {
        this.state.user_obj_vk = e.detail.data;
        this.getUser();
        this.getChallenges();
      }
      else if (e.detail.type === "VKWebAppAccessTokenReceived") {
        this.state.token = e.detail.data.access_token;
        connect.send("VKWebAppCallAPIMethod", {
          "method": "groups.get",
          "params": { extended: 1, "user_id": this.state.user_obj_vk.id, "v": "5.101", filter: "admin", count: 1000, "access_token": this.state.token }
        });
      }
      else if (e.detail.type === "VKWebAppCallAPIMethodResult") {
        this.setState({ user_groups: e.detail.data.response.items })
        // { alert(JSON.stringify(this.state.user_groups, null, 4)) }
      }
    });
    connect.send("VKWebAppGetUserInfo", {});
    connect.send("VKWebAppGetAuthToken", { "app_id": 7138408, "scope": "groups,friends" });
  }

  componentDidUpdate(previousProps, previousState) {
    if (previousState.activeStory !== this.state.activeStory) {
      this.getUser();
      this.getChallenges();
      this.getAllChallenges();
    }
    // if (this.state.user_obj.connected_groups.length == 0 && !this.state.groups_checked) {
    //   this.getUser();
    //   this.setState({ groups_checked: true });
    // }
  }

  getUser() {
    instance.get(`http://192.168.43.150:5000/get_user_info?user_id=${this.state.user_obj_vk.id.toString()}`)
      .then((response) => {
        this.setState({ user_obj: response.data.result });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  getAllChallenges() {
    instance.get(`http://192.168.43.150:5000/get_challenge_list?status=ALL`)
      .then((response) => {
        response.data.result.sort((a, b) => (a.participants.length > b.participants.length) ? 1 : -1)
        this.setState({ all_challenges: response.data.result });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  getChallenges() {
    instance.get(`http://192.168.43.150:5000/get_user_challenges?user_id=${this.state.user_obj_vk.id.toString()}`)
      .then((response) => {
        this.setState({ challenge_obj: response.data.result });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  postChallenge() {
    instance.post('http://192.168.43.150:5000/create_challenge', {
      user_id: this.state.user_obj_vk.id.toString(),
      name: this.state.name,
      description: this.state.desc,
      complete_message: this.state.complete,
      tasks: this.state.task_list,
      max_participants: this.state.max,
      challenge_hashtag: this.state.hash,
      group_publisher: this.state.community,
      winner: this.state.winner
    })
      .then(function (response) {
        alert(response.data.error);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  addGroup(id, name) {
    instance.post('http://192.168.43.150:5000/connect_group', {
      user_id: this.state.user_obj_vk.id.toString(),
      group_id: id,
      group_name: name
    })
      .then(function (response) {
        if (response.data.error) {
          alert(response.data.error);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  get_one_challenge(id) {
    instance.get(`http://192.168.43.150:5000/get_challenge_info?challenge_id=${id}`)
      .then((response) => {
        this.setState({ one_challenge_obj: response.data.result });
        { alert(JSON.stringify(this.state.one_challenge_obj, null, 4)) }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  deleteGroup(id) {
    instance.post('http://192.168.43.150:5000/disconnect_group', {
      user_id: this.state.user_obj_vk.id,
      group_id: id
    })
      .then(function (response) {
        alert(response.data.error);
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
          ><Icon28Newsfeed /></TabbarItem>
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
              Поиск челленджей
            </PanelHeader>
            <Tabs theme="header" type="buttons">
              <TabsItem
                onClick={() => this.setState({ activeTab5: 'popular' })}
                selected={this.state.activeTab5 === 'popular'}>
                Популярное
              </TabsItem>
              <TabsItem
                onClick={() => this.setState({ activeTab5: 'community' })}
                selected={this.state.activeTab5 === 'community'}>
                От сообществ
              </TabsItem>
              <TabsItem
                onClick={() => this.setState({ activeTab5: 'friends' })}
                selected={this.state.activeTab5 === 'friends'}>
                От друзей
              </TabsItem>
            </Tabs>

            {this.state.activeTab5 === 'popular' ? <Group>
              {this.state.all_challenges.length > 0 &&
                <List>
                  <Card className={this.classes.card}>

                  </Card>


                  {/* {this.state.all_challenges.map((item) => (
                    
                  )
                  )} */}
                </List>
              } </Group> : ""}

            {this.state.activeTab5 === 'community' ? <Group>
              {this.state.challenge_obj.length > 0 &&
                <List>
                  pepe
                  {/* {this.state.challenge_obj.map((item) => (
                  
                  )
                  )} */}
                </List>
              } </Group> : ""}

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
            <PanelHeader noShadow> Мои челленджи</PanelHeader>
            <Tabs theme="header" type="buttons">
              <TabsItem
                onClick={() => this.setState({ activeTab6: 'active' })}
                selected={this.state.activeTab6 === 'active'}>
                Активные
              </TabsItem>
              <TabsItem
                onClick={() => this.setState({ activeTab6: 'ended' })}
                selected={this.state.activeTab6 === 'ended'}>
                Завершенные
              </TabsItem>
            </Tabs>

            {this.state.activeTab6 === 'active' ? <Group>
              {this.state.challenge_obj.length > 0 &&
                <List>
                  {this.state.challenge_obj.map((item) => (
                    item.status !== "STOPPED" &&
                    <Cell onClick={() => { this.get_one_challenge(item._id); this.setState({ activeStory: 'challenge_info' }) }} before={<Avatar type="image" src="https://pp.userapi.com/c841025/v841025503/617f7/bkN1Def0s14.jpg" />}
                      description={item.name} asideContent={< Icon24Play fill="var(--accent)" />}> {item.description}</Cell>
                  )
                  )}
                </List>
              } </Group> : ""}

            {this.state.activeTab6 === 'ended' ? <Group>
              {this.state.challenge_obj.length > 0 &&
                <List>
                  {this.state.challenge_obj.map((item) => (
                    item.status === "STOPPED" &&
                    <Cell before={<Avatar type="image" src="https://pp.userapi.com/c841025/v841025503/617f7/bkN1Def0s14.jpg" />} description={item.name} asideContent={<Icon24Add fill="var(--accent)" />}> {item.description}</Cell>
                  )
                  )}
                </List>
              } </Group> : ""}

            <Fab onClick={() => { this.setState({ activeStory: 'create' }) }} style={{ position: 'fixed', bottom: 0, right: 0, marginBottom: "65px", marginRight: "10px" }} color="primary" aria-label="add">
              <AddIcon />
            </Fab>
          </Panel>
        </View>

        <View activePanel="pep" id="create">
          <Panel id="pep" theme="white">
            <PanelHeader left={<HeaderButton onClick={() => { this.setState({ activeStory: 'view4' }) }}>{osname === IOS ? <Icon28ChevronBack /> : <Icon24Back />}</HeaderButton>}>
              Создать
              </PanelHeader>
            <FormLayout>
              <Input value={this.state.name} top="Название" name="name" onChange={this.onChange} />
              <Input value={this.state.desc} top="Описание" name="desc" onChange={this.onChange} />
              <Input value={this.state.complete} top="Сообщение по завершении" name="complete" onChange={this.onChange} />
              <Input value={this.state.hash} top="Хештег челленджа" name="hash" onChange={this.onChange} />
              <Input value={this.state.max} top="Макс. участников" name="max" onChange={this.onChange} />
              <Group title="Кол-во победителей">
                <Select value={this.state.winner} name="winner" onChange={this.onChange} >
                  <option value="0">Нет победителя</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </Select>
              </Group>
              {this.state.user_obj.connected_groups.length > 0 &&
                <Group title="Автор">
                  <Select value={this.state.community} name="community" onChange={this.onChange} >
                    <option value="My account">Мой аккаунт</option>
                    {this.state.user_obj.connected_groups.map((item) => (
                      <option key={item.group_id} value={item.group_id}>{item.group_name}</option>
                    ))}
                  </Select>
                </Group>
              }

              <Group title="Задания">
                {this.state.task_list.length > 0 &&
                  <List>
                    {this.state.task_list.map((item, index) => (
                      <Cell key={item} removable onRemove={() => {
                        this.setState({
                          task_list: [...this.state.task_list.slice(0, index), ...this.state.task_list.slice(index + 1)]
                        })
                      }}>Тип: {item.type} <br /> Описание: {item.description}</Cell>
                    ))}
                  </List>
                }
                <CellButton onClick={() => { this.setState({ activeStory: 'task' }) }} before={<Icon24Add />} >Добавить задание</CellButton>
              </Group>
              <Button onClick={() => { this.postChallenge(); this.setState({ activeStory: 'view1' }) }} size="xl">Создать</Button>
            </FormLayout>
          </Panel>
        </View>

        <View activePanel="new_task" id="task">
          <Panel id="new_task" theme="white">
            <PanelHeader left={<HeaderButton onClick={() => { this.setState({ activeStory: 'view4' }) }}>{osname === IOS ? <Icon28ChevronBack /> : <Icon24Back />}</HeaderButton>} >Добавить задание</PanelHeader>
            <FormLayout>
              <Select placeholder="Тип" name="name_task" onChange={this.onChange} >
                <option value="Хештег">Хештег</option>
                <option value="Репост">Репост</option>
                <option value="Подписка">Подписка</option>
                <option value="Отметка">Отметка в посте</option>
              </Select>
              <Input top="Описание" name="desc_task" onChange={this.onChange} />
              <Input top="Значение" name="value_task" onChange={this.onChange} />
              <Button onClick={() => {
                this.state.task_list.push({
                  type: this.state.name_task,
                  description: this.state.desc_task, value: this.state.value_task
                }); this.setState({ activeStory: 'create' })
              }} size="xl" >Добавить</Button>
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
            <Group>
              <List>
                <Cell expandable before={<Icon24Settings />}>Статистика</Cell>
                <Cell expandable before={<Icon24Settings />}>Достижения</Cell>
                <Cell onClick={() => { this.setState({ activeStory: 'user_groups' }) }} expandable before={<Icon24Settings />}>Мои группы</Cell>
                <Cell expandable before={<Icon24Settings />}>Понравившиеся</Cell>
                <Cell expandable before={<Icon24Settings />}>Настройки</Cell>
              </List>
            </Group>
          </Panel>
        </View>

        <View activePanel="usr_groups" id="user_groups">
          <Panel id="usr_groups">
            <PanelHeader left={<HeaderButton onClick={() => { this.setState({ activeStory: 'more' }) }}>{osname === IOS ? <Icon28ChevronBack /> : <Icon24Back />}</HeaderButton>} >
              Группы
            </PanelHeader>
            <Group>
              <Div>
                На данном экране Вы можете подключить в приложение сообщества, в которых являетесь администратором, чтобы иметь возможность создавать челленджи от их имени!
             </Div>
            </Group>
            {this.state.user_groups.length > 0 &&
              this.state.user_groups.map((item) => (
                <Cell
                  size="l"
                  before={<Avatar src={item.photo_100} />}
                  bottomContent={<Button onClick={() => { this.addGroup(item.id, item.name); this.getUser() }} >Добавить</Button>}
                >
                  {item.name}
                </Cell>
              ))
            }
          </Panel>
        </View>

        <View activePanel="ch_info" id="challenge_info">
          <Panel id="ch_info">
            <ChallengeInfo name={this.state.one_challenge_obj.name} desc="" />
          </Panel>
        </View>

      </Epic>
    )
  }
}

<VKchallenge />
ReactDOM.render(<VKchallenge />, document.getElementById('root')); 
