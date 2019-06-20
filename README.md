# Titan project

An attempt to make a **web interface** to facilitate development of **Logstash configuration files**

![Titan project frontend image](doc/titan-project-frontend.png)

## Installation

### Docker

The **easier way to deploy** this application is via the [docker-compose](docker-compose.yml) file associated with this project.

You will need to install :
- [Docker](https://www.docker.com/)
- [Docker compose](https://docs.docker.com/compose/)

Once the requirements met, you need to build on your Docker host the [log-parser](https://github.com/GroupePSA/log-parser) builder image for the **parser** executable, as descript here :

> https://github.com/GroupePSA/log-parser#log-parser

And then just type in a terminal, once this project is downloaded :

```bash
docker-compose up -d
```

**Application** will then be available at http://localhost:8080/

## Deployment considerations

As we use a **real Logstash** to test the parsing of our logs, and he is a little **CPU hungry**, if this application is intended to be use by **multiple persons at the same time**, you should :
- Use a **dedicated machine**
- Each job parsing will use 1~2.5 CPU for about 15s, so **the more CPU the better**
- **RAM isn't a huge requirements**, it will use at max 1Go / job


## Development

If you want to participate to this project, you can use the [Vagrantfile](Vagrantfile) present in this project.

You will need to install :
- [Vagrant](https://www.vagrantup.com/)
- [VirtualBox](https://www.virtualbox.org/)

If you are beyond a proxy, you need to have the [Vagrant plugin proxy-conf](https://github.com/tmatilai/vagrant-proxyconf) installed

Once done, go into a command-line and launch the VM:

```bash
# Create and boot the machine
vagrant up
```

You will then have the access to :
- The **frontend** at http://localhost:8080
- The **backend** at http://localhost:8081

## Contributing

All contributions are welcome: ideas, patches, documentation, bug reports,
complaints, and even something you drew up on a napkin.

Programming is not a required skill. Whatever you've seen about open source and
maintainers or community members  saying "send patches or die" - you will not
see that here.

It is more important to me that you are able to contribute.
